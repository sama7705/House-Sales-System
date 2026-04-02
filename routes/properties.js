const express = require('express');

const router = express.Router();
const passwordHasher = require('../utils/password');

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
 *         image_url:
 *           type: string
 *           nullable: true
 *           example: https://images.example.com/property-1.jpg
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
 *         image_url:
 *           type: string
 *           nullable: true
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
 *         image_url:
 *           type: string
 *           nullable: true
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

router.get('/properties/:id', (req, res) => {
  getPropertyById(req.db, req.params.id, (err, property) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (!property) {
      return res.status(404).render('404');
    }

    return res.render('property-details', { property });
  });
});

function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { type: 'error', text: 'Please login first.' };
    return res.redirect('/login');
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.session.flash = { type: 'error', text: 'Admin access is required for this action.' };
    return res.redirect('/');
  }
  return next();
}

function normalizeUserInput({ name, email, password, role }) {
  return {
    name: name ? name.trim() : '',
    email: email ? email.trim().toLowerCase() : '',
    password: password || '',
    role: role === 'admin' ? 'admin' : 'user'
  };
}

function validateRegisterInput(input) {
  const errors = [];

  if (!input.name || input.name.length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }

  if (!/^\S+@\S+\.\S+$/.test(input.email)) {
    errors.push('Please enter a valid email address.');
  }

  if (!input.password || input.password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  return errors;
}

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  return res.render('login', { error: null, formData: {} });
});

router.post('/login', (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password || '';

  if (!email || !password) {
    return res.status(400).render('login', {
      error: 'Email and password are required.',
      formData: { email }
    });
  }

  return req.db.get('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).render('login', {
        error: 'Database error. Please try again.',
        formData: { email }
      });
    }

    if (!user) {
      return res.status(401).render('login', {
        error: 'Invalid email or password.',
        formData: { email }
      });
    }

    return passwordHasher.compare(password, user.password_hash, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return res.status(401).render('login', {
          error: 'Invalid email or password.',
          formData: { email }
        });
      }

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      req.session.flash = { type: 'success', text: `Welcome back, ${user.name}!` };
      return res.redirect('/');
    });
  });
});

router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  return res.render('register', { errors: [], formData: {} });
});

router.post('/register', (req, res) => {
  const input = normalizeUserInput(req.body);
  const errors = validateRegisterInput(input);

  if (errors.length > 0) {
    return res.status(400).render('register', {
      errors,
      formData: {
        name: input.name,
        email: input.email,
        role: input.role
      }
    });
  }

  return req.db.get('SELECT id FROM users WHERE email = ?', [input.email], (checkErr, existingUser) => {
    if (checkErr) {
      return res.status(500).render('register', {
        errors: ['Database error. Please try again.'],
        formData: { name: input.name, email: input.email, role: input.role }
      });
    }

    if (existingUser) {
      return res.status(409).render('register', {
        errors: ['This email is already registered.'],
        formData: { name: input.name, email: input.email, role: input.role }
      });
    }

    return passwordHasher.hash(input.password, 10, (hashErr, hash) => {
      if (hashErr) {
        return res.status(500).render('register', {
          errors: ['Could not secure password. Please try again.'],
          formData: { name: input.name, email: input.email, role: input.role }
        });
      }

      return req.db.run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [input.name, input.email, hash, input.role],
        function onCreate(insertErr) {
          if (insertErr) {
            return res.status(500).render('register', {
              errors: ['Could not create account. Please try again.'],
              formData: { name: input.name, email: input.email, role: input.role }
            });
          }

          req.session.user = {
            id: this.lastID,
            name: input.name,
            email: input.email,
            role: input.role
          };
          req.session.flash = { type: 'success', text: 'Registration completed successfully.' };
          return res.redirect('/');
        }
      );
    });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

router.get('/dashboard', requireLogin, requireAdmin, (req, res) => {
  req.db.all('SELECT * FROM properties ORDER BY id DESC', [], (err, properties) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    return req.db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', [], (usersErr, users) => {
      if (usersErr) {
        return res.status(500).send('Database error');
      }

      return res.render('dashboard', { properties, users });
    });
  });
});

router.get('/add-property', requireLogin, requireAdmin, (req, res) => {
  res.render('add-property', { error: null, formData: {} });
});

router.post('/add-property', requireLogin, requireAdmin, (req, res) => {
  const {
    title,
    location,
    price,
    type,
    bedrooms,
    bathrooms,
    area,
    description,
    image_url
  } = req.body;

  if (hasInvalidRequiredFields(req.body)) {
    return res.status(400).render('add-property', {
      error: 'Please complete all required fields with valid values.',
      formData: req.body
    });
  }

  return req.db.run(
    `INSERT INTO properties
      (title, location, price, type, bedrooms, bathrooms, area, status, description, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title.trim(),
      location.trim(),
      Number(price),
      type,
      Number(bedrooms),
      Number(bathrooms),
      Number(area),
      'Available',
      description ? description.trim() : null,
      image_url ? image_url.trim() : null
    ],
    (err) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      req.session.flash = { type: 'success', text: 'Property added successfully.' };
      return res.redirect('/dashboard');
    }
  );
});

router.get('/properties/:id/edit', requireLogin, requireAdmin, (req, res) => {
  getPropertyById(req.db, req.params.id, (err, property) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (!property) {
      return res.status(404).render('404');
    }

    return res.render('edit-property', { error: null, property });
  });
});

router.post('/properties/:id/edit', requireLogin, requireAdmin, (req, res) => {
  const {
    title,
    location,
    price,
    type,
    bedrooms,
    bathrooms,
    area,
    status,
    description,
    image_url
  } = req.body;

  if (hasInvalidRequiredFields(req.body) || !['Available', 'Sold'].includes(status)) {
    return res.status(400).render('edit-property', {
      error: 'Please complete all required fields with valid values.',
      property: { ...req.body, id: req.params.id }
    });
  }

  return req.db.run(
    `UPDATE properties
     SET title = ?, location = ?, price = ?, type = ?, bedrooms = ?, bathrooms = ?, area = ?, status = ?, description = ?, image_url = ?
     WHERE id = ?`,
    [
      title.trim(),
      location.trim(),
      Number(price),
      type,
      Number(bedrooms),
      Number(bathrooms),
      Number(area),
      status,
      description ? description.trim() : null,
      image_url ? image_url.trim() : null,
      req.params.id
    ],
    (err) => {
      if (err) {
        return res.status(500).send('Database error');
      }

      req.session.flash = { type: 'success', text: 'Property updated successfully.' };
      return res.redirect('/dashboard');
    }
  );
});

router.post('/sold/:id', requireLogin, requireAdmin, (req, res) => {
  req.db.run('UPDATE properties SET status = ? WHERE id = ?', ['Sold', req.params.id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    req.session.flash = { type: 'success', text: 'Property marked as sold.' };
    return res.redirect('back');
  });
});

router.post('/delete/:id', requireLogin, requireAdmin, (req, res) => {
  req.db.run('DELETE FROM properties WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    req.session.flash = { type: 'success', text: 'Property deleted successfully.' };
    return res.redirect('/dashboard');
  });
});

module.exports = router;
