const express = require('express');

const router = express.Router();

const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

function getAllHouses(db, callback) {
  db.all('SELECT * FROM houses ORDER BY id DESC', [], callback);
}

function isInvalidPrice(price) {
  return price === undefined || price === null || Number.isNaN(Number(price));
}

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  return next();
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
 *   responses:
 *     HousesListResponse:
 *       description: Houses fetched successfully.
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/House'
 *           example:
 *             - id: 2
 *               title: Downtown Loft
 *               location: Seattle, WA
 *               price: 615000
 *               status: Available
 *             - id: 1
 *               title: Family Retreat
 *               location: Austin, TX
 *               price: 450000
 *               status: Sold
 *     HouseResponse:
 *       description: House fetched successfully.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/House'
 *           example:
 *             id: 1
 *             title: Family Retreat
 *             location: Austin, TX
 *             price: 450000
 *             status: Available
 *     HouseCreatedResponse:
 *       description: House created successfully.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/House'
 *           example:
 *             id: 3
 *             title: Cozy Cottage
 *             location: Denver, CO
 *             price: 325000
 *             status: Available
 *     MessageResponse:
 *       description: Request completed successfully.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiMessage'
 *           example:
 *             message: House deleted successfully
 *     MissingFieldsError:
 *       description: Bad Request - missing or invalid required fields.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error: Title, location, and valid price are required.
 *     HouseNotFoundError:
 *       description: Not Found - house with the provided id does not exist.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error: House not found
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
    return res.render('index', { houses });
  });
});

/**
 * @swagger
 * /login:
 *   get:
 *     tags: [Web]
 *     summary: Show login page
 *     description: Opens a simple login form for admin access.
 *     responses:
 *       200:
 *         description: Login page loaded.
 */
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  return res.render('login', { error: null, formData: {} });
});

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Web]
 *     summary: Login with hardcoded admin account
 *     description: Validates email and password, then stores session on success.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       302:
 *         description: Redirects to home after successful login.
 *       401:
 *         description: Invalid credentials.
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    req.session.user = { email: ADMIN_USER.email };
    return res.redirect('/');
  }

  return res.status(401).render('login', {
    error: 'Invalid email or password.',
    formData: { email }
  });
});

/**
 * @swagger
 * /logout:
 *   post:
 *     tags: [Web]
 *     summary: Logout current user
 *     description: Destroys session and redirects to login page.
 *     responses:
 *       302:
 *         description: Redirects to login page.
 */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
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
router.get('/add', requireLogin, (req, res) => {
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
router.post('/add', requireLogin, (req, res) => {
  const db = req.db;
  const { title, location, price } = req.body;

  if (!title || !location || isInvalidPrice(price)) {
    return res.status(400).render('add-house', {
      error: 'Title, location, and price are required.',
      formData: { title, location, price }
    });
  }

  return db.run(
    'INSERT INTO houses (title, location, price, status) VALUES (?, ?, ?, ?)',
    [title.trim(), location.trim(), Number(price), 'Available'],
    (err) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      return res.redirect('/');
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
router.post('/sold/:id', requireLogin, (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('UPDATE houses SET status = ? WHERE id = ?', ['Sold', id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    return res.redirect('/');
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
router.post('/delete/:id', requireLogin, (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('DELETE FROM houses WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    return res.redirect('/');
  });
});

module.exports = router;
