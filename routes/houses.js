const express = require('express');

const router = express.Router();

function getAllHouses(db, callback) {
  db.all('SELECT * FROM houses ORDER BY id DESC', [], callback);
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
 *           example: Available
 *       required:
 *         - id
 *         - title
 *         - location
 *         - price
 *         - status
 */

/**
 * @swagger
 * /:
 *   get:
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
 *     summary: Create a new house (form submit)
 *     description: Creates a new house from form values and redirects to home.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - location
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Cozy Cottage
 *               location:
 *                 type: string
 *                 example: Denver, CO
 *               price:
 *                 type: number
 *                 example: 325000
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

  if (!title || !location || !price || Number.isNaN(Number(price))) {
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
 *     summary: List all houses (JSON)
 *     description: Returns all houses as JSON for API testing.
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
 * /api/houses:
 *   post:
 *     summary: Create a house (JSON)
 *     description: Creates a new house from JSON data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - location
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Downtown Loft
 *               location:
 *                 type: string
 *                 example: Seattle, WA
 *               price:
 *                 type: number
 *                 example: 510000
 *     responses:
 *       201:
 *         description: House created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/House'
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Database error.
 */
router.post('/api/houses', (req, res) => {
  const db = req.db;
  const { title, location, price } = req.body;

  if (!title || !location || price === undefined || Number.isNaN(Number(price))) {
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
 * /api/houses/{id}/sold:
 *   patch:
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
