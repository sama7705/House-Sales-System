const express = require('express');

const router = express.Router();

function getAllHouses(db, callback) {
  db.all('SELECT * FROM houses ORDER BY id DESC', [], callback);
}

function getHouseById(db, id, callback) {
  db.get('SELECT * FROM houses WHERE id = ?', [id], callback);
}

function isInvalidPrice(price) {
  return price === undefined || price === null || Number.isNaN(Number(price));
}

/**
 * @swagger
 * /api/houses:
 *   get:
 *     tags: [API]
 *     summary: List all houses (JSON)
 *     description: Returns all houses as JSON for API testing in Swagger.
 *     responses:
 *       200:
 *         $ref: '#/components/responses/HousesListResponse'
 *       500:
 *         description: Database error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/houses', (req, res) => {
  const db = req.db;
  getAllHouses(db, (err, houses) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(houses);
  });
});

/**
 * @swagger
 * /api/houses/{id}:
 *   get:
 *     tags: [API]
 *     summary: Get one house by id (JSON)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         $ref: '#/components/responses/HouseResponse'
 *       404:
 *         $ref: '#/components/responses/HouseNotFoundError'
 */
router.get('/houses/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  getHouseById(db, id, (err, house) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!house) {
      return res.status(404).json({ error: 'House not found' });
    }

    return res.json(house);
  });
});

/**
 * @swagger
 * /api/houses:
 *   post:
 *     tags: [API]
 *     summary: Create a house (JSON)
 *     description: Creates a new house from JSON data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HouseInput'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/HouseCreatedResponse'
 *       400:
 *         $ref: '#/components/responses/MissingFieldsError'
 */
router.post('/houses', (req, res) => {
  const db = req.db;
  const { title, location, price } = req.body;

  if (!title || !location || isInvalidPrice(price)) {
    return res.status(400).json({ error: 'Title, location, and valid price are required.' });
  }

  db.run(
    'INSERT INTO houses (title, location, price, status) VALUES (?, ?, ?, ?)',
    [title.trim(), location.trim(), Number(price), 'Available'],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        title: title.trim(),
        location: location.trim(),
        price: Number(price),
        status: 'Available'
      });
    }
  );
});

/**
 * @swagger
 * /api/houses/{id}:
 *   patch:
 *     tags: [API]
 *     summary: Update one house partially (JSON)
 *     description: Update title, location, price, and/or status for a house.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HousePatchInput'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/HouseResponse'
 *       400:
 *         $ref: '#/components/responses/MissingFieldsError'
 *       404:
 *         $ref: '#/components/responses/HouseNotFoundError'
 */
router.patch('/houses/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { title, location, price, status } = req.body;

  if ([title, location, price, status].every((field) => field === undefined)) {
    return res.status(400).json({ error: 'Provide at least one field to update.' });
  }

  if (price !== undefined && isInvalidPrice(price)) {
    return res.status(400).json({ error: 'Price must be a valid number.' });
  }

  if (status !== undefined && !['Available', 'Sold'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Available or Sold.' });
  }

  getHouseById(db, id, (readErr, existingHouse) => {
    if (readErr) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!existingHouse) {
      return res.status(404).json({ error: 'House not found' });
    }

    const nextTitle = title !== undefined ? title.trim() : existingHouse.title;
    const nextLocation = location !== undefined ? location.trim() : existingHouse.location;
    const nextPrice = price !== undefined ? Number(price) : existingHouse.price;
    const nextStatus = status !== undefined ? status : existingHouse.status;

    db.run(
      'UPDATE houses SET title = ?, location = ?, price = ?, status = ? WHERE id = ?',
      [nextTitle, nextLocation, nextPrice, nextStatus, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        return res.json({
          id: Number(id),
          title: nextTitle,
          location: nextLocation,
          price: nextPrice,
          status: nextStatus
        });
      }
    );
  });
});

/**
 * @swagger
 * /api/houses/{id}/sold:
 *   patch:
 *     tags: [API]
 *     summary: Mark a house as sold (JSON)
 *     description: Updates the selected house status to Sold.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         $ref: '#/components/responses/MessageResponse'
 *       404:
 *         $ref: '#/components/responses/HouseNotFoundError'
 *       500:
 *         description: Database error.
 */
router.patch('/houses/:id/sold', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('UPDATE houses SET status = ? WHERE id = ?', ['Sold', id], function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'House not found' });
    }

    res.json({ message: 'House marked as sold' });
  });
});

/**
 * @swagger
 * /api/houses/{id}:
 *   delete:
 *     tags: [API]
 *     summary: Delete a house (JSON)
 *     description: Deletes the selected house.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         $ref: '#/components/responses/MessageResponse'
 *       404:
 *         $ref: '#/components/responses/HouseNotFoundError'
 *       500:
 *         description: Database error.
 */
router.delete('/houses/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('DELETE FROM houses WHERE id = ?', [id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'House not found' });
    }

    res.json({ message: 'House deleted successfully' });
  });
});

module.exports = router;
