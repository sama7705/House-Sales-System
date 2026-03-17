const express = require('express');

const router = express.Router();

function getAllProperties(db, callback) {
  db.all('SELECT * FROM properties ORDER BY id DESC', [], callback);
}

function getPropertyById(db, id, callback) {
  db.get('SELECT * FROM properties WHERE id = ?', [id], callback);
}

function isInvalidNumber(value) {
  return value === undefined || value === null || Number.isNaN(Number(value));
}

router.get('/properties', (req, res) => {
  getAllProperties(req.db, (err, properties) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    return res.json(properties);
  });
});

router.get('/properties/:id', (req, res) => {
  getPropertyById(req.db, req.params.id, (err, property) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    return res.json(property);
  });
});

/**
 * @swagger
 * /api/properties:
 *   get:
 *     tags: [API]
 *     summary: List all properties (JSON)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PropertiesListResponse'
 */
router.post('/properties', (req, res) => {
  const {
    title,
    location,
    price,
    type,
    bedrooms,
    bathrooms,
    area,
    description
  } = req.body;

  if (
    !title
    || !location
    || !type
    || isInvalidNumber(price)
    || isInvalidNumber(bedrooms)
    || isInvalidNumber(bathrooms)
    || isInvalidNumber(area)
  ) {
    return res.status(400).json({
      error: 'Title, location, type, price, bedrooms, bathrooms, and area are required.'
    });
  }

  return req.db.run(
    `INSERT INTO properties
      (title, location, price, type, bedrooms, bathrooms, area, status, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title.trim(),
      location.trim(),
      Number(price),
      type,
      Number(bedrooms),
      Number(bathrooms),
      Number(area),
      'Available',
      description ? description.trim() : null
    ],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      return res.status(201).json({
        id: this.lastID,
        title: title.trim(),
        location: location.trim(),
        price: Number(price),
        type,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: Number(area),
        status: 'Available',
        description: description ? description.trim() : null
      });
    }
  );
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     tags: [API]
 *     summary: Get one property by id (JSON)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PropertyResponse'
 *       404:
 *         $ref: '#/components/responses/PropertyNotFoundError'
 *   patch:
 *     tags: [API]
 *     summary: Update one property partially (JSON)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyPatchInput'
 */
router.patch('/properties/:id', (req, res) => {
  const { id } = req.params;
  const {
    title,
    location,
    price,
    type,
    bedrooms,
    bathrooms,
    area,
    status,
    description
  } = req.body;

  if ([title, location, price, type, bedrooms, bathrooms, area, status, description].every((value) => value === undefined)) {
    return res.status(400).json({ error: 'Provide at least one field to update.' });
  }

  if (
    (price !== undefined && isInvalidNumber(price))
    || (bedrooms !== undefined && isInvalidNumber(bedrooms))
    || (bathrooms !== undefined && isInvalidNumber(bathrooms))
    || (area !== undefined && isInvalidNumber(area))
  ) {
    return res.status(400).json({ error: 'Price, bedrooms, bathrooms, and area must be valid numbers.' });
  }

  if (status !== undefined && !['Available', 'Sold'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Available or Sold.' });
  }

  getPropertyById(req.db, id, (readErr, existingProperty) => {
    if (readErr) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updated = {
      title: title !== undefined ? title.trim() : existingProperty.title,
      location: location !== undefined ? location.trim() : existingProperty.location,
      price: price !== undefined ? Number(price) : existingProperty.price,
      type: type !== undefined ? type : existingProperty.type,
      bedrooms: bedrooms !== undefined ? Number(bedrooms) : existingProperty.bedrooms,
      bathrooms: bathrooms !== undefined ? Number(bathrooms) : existingProperty.bathrooms,
      area: area !== undefined ? Number(area) : existingProperty.area,
      status: status !== undefined ? status : existingProperty.status,
      description: description !== undefined ? description : existingProperty.description
    };

    return req.db.run(
      `UPDATE properties
       SET title = ?, location = ?, price = ?, type = ?, bedrooms = ?, bathrooms = ?, area = ?, status = ?, description = ?
       WHERE id = ?`,
      [
        updated.title,
        updated.location,
        updated.price,
        updated.type,
        updated.bedrooms,
        updated.bathrooms,
        updated.area,
        updated.status,
        updated.description,
        id
      ],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        return res.json({ id: Number(id), ...updated });
      }
    );
  });
});

/**
 * @swagger
 * /api/properties/{id}/sold:
 *   patch:
 *     tags: [API]
 *     summary: Mark a property as sold (JSON)
 */
router.patch('/properties/:id/sold', (req, res) => {
  req.db.run('UPDATE properties SET status = ? WHERE id = ?', ['Sold', req.params.id], function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    return res.json({ message: 'Property marked as sold' });
  });
});

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     tags: [API]
 *     summary: Delete a property (JSON)
 */
router.delete('/properties/:id', (req, res) => {
  req.db.run('DELETE FROM properties WHERE id = ?', [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    return res.json({ message: 'Property deleted successfully' });
  });
});

module.exports = router;
