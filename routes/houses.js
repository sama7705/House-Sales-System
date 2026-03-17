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
 * components:
 *   schemas:
 *     House:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Modern Family Home
 *         location:
 *           type: string
 *           example: Austin, TX
 *         price:
 *           type: number
 *           format: float
 *           example: 450000
 *         status:
 *           type: string
 *           enum: [Available, Sold]
 *           example: Available
 *       required:
 *         - id
 *         - title
 *         - location
 *         - price
 *         - status
 *     HouseInput:
 *       type: object
 *       required:
 *         - title
 *         - location
 *         - price
 *       properties:
 *         title:
 *           type: string
 *           example: Cozy Cottage
 *         location:
 *           type: string
 *           example: Denver, CO
 *         price:
 *           type: number
 *           example: 325000
 *     HousePatchInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Updated House Name
 *         location:
 *           type: string
 *           example: Portland, OR
 *         price:
 *           type: number
 *           example: 400000
 *         status:
 *           type: string
 *           enum: [Available, Sold]
 *           example: Sold
 *     ApiMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: House deleted successfully
 *     ApiError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: House not found
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Web]
 *     summary: List all houses (EJS page)
 *     description: Loads the home page and shows all houses in a table.
 *     responses:
 *       200:
 *         description: Page loaded successfully.
 *       500:
 *         description: Database error.
 */
router.get('/', (req, res) => {
  const db = req.db;
  getAllHouses(db, (err, houses) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('index', { houses });
  });
});

/**
 * @swagger
 * /add:
 *   get:
 *     tags: [Web]
 *     summary: Show add house page
 *     description: Opens the EJS form used to add a new house.
 *     responses:
 *       200:
 *         description: Add house form page loaded.
 */
router.get('/add', (req, res) => {
  res.render('add-house', { error: null, formData: {} });
});

/**
 * @swagger
 * /add:
 *   post:
 *     tags: [Web]
 *     summary: Create a new house (form submit)
 *     description: Creates a new house from form values and redirects to home.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/HouseInput'
 *     responses:
 *       302:
 *         description: House created and redirected to home page.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Database error.
 */
router.post('/add', (req, res) => {
  const db = req.db;
  const { title, location, price } = req.body;

  if (!title || !location || isInvalidPrice(price)) {
    return res.status(400).render('add-house', {
      error: 'Title, location, and price are required.',
      formData: { title, location, price }
    });
  }

  db.run(
    'INSERT INTO houses (title, location, price, status) VALUES (?, ?, ?, ?)',
    [title.trim(), location.trim(), Number(price), 'Available'],
    (err) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      res.redirect('/');
    }
  );
});

/**
 * @swagger
 * /sold/{id}:
 *   post:
 *     tags: [Web]
 *     summary: Mark a house as sold (form submit)
 *     description: Updates a house status to Sold, then redirects to home.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       302:
 *         description: House marked as sold and redirected.
 *       500:
 *         description: Database error.
 */
router.post('/sold/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('UPDATE houses SET status = ? WHERE id = ?', ['Sold', id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/');
  });
});

/**
 * @swagger
 * /delete/{id}:
 *   post:
 *     tags: [Web]
 *     summary: Delete a house (form submit)
 *     description: Deletes a house and redirects to home.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       302:
 *         description: House deleted and redirected.
 *       500:
 *         description: Database error.
 */
router.post('/delete/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('DELETE FROM houses WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/');
  });
});

/**
 * @swagger
 * /api/houses:
 *   get:
 *     tags: [API]
 *     summary: List all houses (JSON)
 *     description: Returns all houses as JSON for API testing in Swagger.
 *     responses:
 *       200:
 *         description: Houses fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/House'
 *       500:
 *         description: Database error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/api/houses', (req, res) => {
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
 *         description: House fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/House'
 *       404:
 *         description: House not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/api/houses/:id', (req, res) => {
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
 *         description: House created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/House'
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/api/houses', (req, res) => {
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
 *         description: House updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/House'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: House not found.
 */
router.patch('/api/houses/:id', (req, res) => {
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
 *         description: House marked as sold.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessage'
 *       404:
 *         description: House not found.
 *       500:
 *         description: Database error.
 */
router.patch('/api/houses/:id/sold', (req, res) => {
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
 *         description: House deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessage'
 *       404:
 *         description: House not found.
 *       500:
 *         description: Database error.
 */
router.delete('/api/houses/:id', (req, res) => {
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
