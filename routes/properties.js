const express = require('express');

const router = express.Router();

const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

function isValidNumber(value) {
  return value !== undefined && value !== null && value !== '' && !Number.isNaN(Number(value));
}

function buildPropertyFilters(query) {
  const {
    search,
    type,
    status,
    minPrice,
    maxPrice
  } = query;

  const clauses = [];
  const params = [];
  const filters = {
    search: search ? search.trim() : '',
    type: type ? type.trim() : '',
    status: status ? status.trim() : '',
    minPrice: minPrice || '',
    maxPrice: maxPrice || ''
  };

  if (filters.search) {
    clauses.push('(title LIKE ? OR location LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.type) {
    clauses.push('type = ?');
    params.push(filters.type);
  }

  if (filters.status) {
    clauses.push('status = ?');
    params.push(filters.status);
  }

  if (isValidNumber(filters.minPrice)) {
    clauses.push('price >= ?');
    params.push(Number(filters.minPrice));
  }

  if (isValidNumber(filters.maxPrice)) {
    clauses.push('price <= ?');
    params.push(Number(filters.maxPrice));
  }

  return {
    whereClause: clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '',
    params,
    filters
  };
}

function getFilteredProperties(db, query, callback) {
  const { whereClause, params } = buildPropertyFilters(query);
  db.all(`SELECT * FROM properties${whereClause} ORDER BY id DESC`, params, callback);
}

function getPropertyById(db, id, callback) {
  db.get('SELECT * FROM properties WHERE id = ?', [id], callback);
}

function hasInvalidRequiredFields(propertyData) {
  const {
    title,
    location,
    price,
    type,
    bedrooms,
    bathrooms,
    area
  } = propertyData;

  return (
    !title
    || !location
    || !type
    || Number.isNaN(Number(price))
    || Number.isNaN(Number(bedrooms))
    || Number.isNaN(Number(bathrooms))
    || Number.isNaN(Number(area))
  );
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
 *     Property:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: City View Apartment
 *         location:
 *           type: string
 *           example: Austin, TX
 *         price:
 *           type: number
 *           format: float
 *           example: 450000
 *         type:
 *           type: string
 *           example: Apartment
 *         bedrooms:
 *           type: integer
 *           example: 3
 *         bathrooms:
 *           type: integer
 *           example: 2
 *         area:
 *           type: number
 *           format: float
 *           example: 135.5
 *         status:
 *           type: string
 *           enum: [Available, Sold]
 *           example: Available
 *         description:
 *           type: string
 *           example: Bright apartment near city center.
 *       required:
 *         - id
 *         - title
 *         - location
 *         - price
 *         - type
 *         - bedrooms
 *         - bathrooms
 *         - area
 *         - status
 *     PropertyInput:
 *       type: object
 *       required:
 *         - title
 *         - location
 *         - price
 *         - type
 *         - bedrooms
 *         - bathrooms
 *         - area
 *       properties:
 *         title:
 *           type: string
 *         location:
 *           type: string
 *         price:
 *           type: number
 *         type:
 *           type: string
 *           enum: [Apartment, Villa, House, Chalet, Office]
 *         bedrooms:
 *           type: integer
 *         bathrooms:
 *           type: integer
 *         area:
 *           type: number
 *         description:
 *           type: string
 *     PropertyPatchInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         location:
 *           type: string
 *         price:
 *           type: number
 *         type:
 *           type: string
 *           enum: [Apartment, Villa, House, Chalet, Office]
 *         bedrooms:
 *           type: integer
 *         bathrooms:
 *           type: integer
 *         area:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Available, Sold]
 *         description:
 *           type: string
 *     ApiMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Property deleted successfully
 *     ApiError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Property not found
 *   responses:
 *     PropertiesListResponse:
 *       description: Properties fetched successfully.
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Property'
 *     PropertyResponse:
 *       description: Property fetched successfully.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     PropertyCreatedResponse:
 *       description: Property created successfully.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     MessageResponse:
 *       description: Request completed successfully.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiMessage'
 *     MissingFieldsError:
 *       description: Bad Request - missing or invalid required fields.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     PropertyNotFoundError:
 *       description: Not Found - property with the provided id does not exist.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Web]
 *     summary: List all properties (EJS page)
 */
router.get('/', (req, res) => {
  getFilteredProperties(req.db, req.query, (err, properties) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    const { filters } = buildPropertyFilters(req.query);
    return res.render('index', { properties, filters });
  });
});

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     tags: [Web]
 *     summary: Show one property details page
 */
router.get('/properties/:id', (req, res) => {
  getPropertyById(req.db, req.params.id, (err, property) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (!property) {
      return res.status(404).send('Property not found');
    }

    return res.render('property-details', { property });
  });
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  return res.render('login', { error: null, formData: {} });
});

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

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

/**
 * @swagger
 * /add-property:
 *   get:
 *     tags: [Web]
 *     summary: Show add property page
 */
router.get('/add-property', requireLogin, (req, res) => {
  res.render('add-property', { error: null, formData: {} });
});

/**
 * @swagger
 * /add-property:
 *   post:
 *     tags: [Web]
 *     summary: Create a new property (form submit)
 */
router.post('/add-property', requireLogin, (req, res) => {
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

  if (hasInvalidRequiredFields(req.body)) {
    return res.status(400).render('add-property', {
      error: 'Please complete all required fields with valid values.',
      formData: req.body
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
    (err) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      return res.redirect('/');
    }
  );
});

router.post('/sold/:id', requireLogin, (req, res) => {
  req.db.run('UPDATE properties SET status = ? WHERE id = ?', ['Sold', req.params.id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    return res.redirect('/');
  });
});

router.post('/delete/:id', requireLogin, (req, res) => {
  req.db.run('DELETE FROM properties WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    return res.redirect('/');
  });
});

module.exports = router;
