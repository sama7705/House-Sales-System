const path = require('path');
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const passwordHasher = require('./utils/password');

const propertyRoutes = require('./routes/properties');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

const dbPath = path.join(__dirname, 'houses.db');
const db = new sqlite3.Database(dbPath);

function ensurePropertiesTable(database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      price REAL NOT NULL,
      type TEXT NOT NULL DEFAULT 'House',
      bedrooms INTEGER NOT NULL DEFAULT 0,
      bathrooms INTEGER NOT NULL DEFAULT 0,
      area REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Available',
      description TEXT,
      image_url TEXT DEFAULT NULL
    )
  `);
}

function ensureUsersTable(database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function seedDefaultAdminUser(database) {
  database.get('SELECT id FROM users WHERE email = ?', ['admin@example.com'], (err, row) => {
    if (err || row) {
      return;
    }

    passwordHasher.hash('admin123', 10, (hashErr, adminPasswordHash) => {
      if (hashErr) {
        return;
      }

      database.run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['System Admin', 'admin@example.com', adminPasswordHash, 'admin']
      );
    });
  });
}

function addMissingPropertyColumns(database) {
  const requiredColumns = [
    { name: 'type', sql: "ALTER TABLE properties ADD COLUMN type TEXT NOT NULL DEFAULT 'House'" },
    { name: 'bedrooms', sql: 'ALTER TABLE properties ADD COLUMN bedrooms INTEGER NOT NULL DEFAULT 0' },
    { name: 'bathrooms', sql: 'ALTER TABLE properties ADD COLUMN bathrooms INTEGER NOT NULL DEFAULT 0' },
    { name: 'area', sql: 'ALTER TABLE properties ADD COLUMN area REAL NOT NULL DEFAULT 0' },
    { name: 'description', sql: 'ALTER TABLE properties ADD COLUMN description TEXT' },
    { name: 'image_url', sql: 'ALTER TABLE properties ADD COLUMN image_url TEXT DEFAULT NULL' }
  ];

  database.all('PRAGMA table_info(properties)', [], (err, columns) => {
    if (err) {
      console.error('Could not inspect properties table.', err.message);
      return;
    }

    const existing = new Set(columns.map((column) => column.name));

    requiredColumns.forEach((column) => {
      if (!existing.has(column.name)) {
        database.run(column.sql, (alterErr) => {
          if (alterErr) {
            console.error(`Could not add column ${column.name}.`, alterErr.message);
          }
        });
      }
    });
  });
}

function migrateHousesIntoProperties(database) {
  database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='houses'", [], (tableErr, tableRow) => {
    if (tableErr || !tableRow) {
      return;
    }

    database.get('SELECT COUNT(*) AS count FROM properties', [], (countErr, countRow) => {
      if (countErr || countRow.count > 0) {
        return;
      }

      database.run(
        `INSERT INTO properties (title, location, price, type, bedrooms, bathrooms, area, status, description)
         SELECT title, location, price, 'House', 0, 0, 0, status, 'Migrated from old houses table.' FROM houses`
      );
    });
  });
}

function seedSampleProperties(database) {
  const sampleProperties = [
    {
      title: 'Modern Villa in Cairo',
      location: 'Cairo',
      price: 4500000,
      type: 'Villa',
      bedrooms: 5,
      bathrooms: 4,
      area: 420,
      description: 'A modern villa with a private garden in a quiet neighborhood.',
      status: 'Available'
    },
    {
      title: 'Family Apartment in Giza',
      location: 'Giza',
      price: 1850000,
      type: 'Apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      description: 'Comfortable family apartment close to schools and services.',
      status: 'Available'
    },
    {
      title: 'Sea View Chalet in Alexandria',
      location: 'Alexandria',
      price: 2600000,
      type: 'Chalet',
      bedrooms: 3,
      bathrooms: 2,
      area: 210,
      description: 'Chalet with a sea view and easy access to the beach.',
      status: 'Available'
    },
    {
      title: 'Office Space in New Cairo',
      location: 'New Cairo',
      price: 3200000,
      type: 'Office',
      bedrooms: 0,
      bathrooms: 2,
      area: 260,
      description: 'Ready-to-use office space in a business-focused district.',
      status: 'Available'
    },
    {
      title: 'Luxury Penthouse in Zamalek',
      location: 'Zamalek',
      price: 7800000,
      type: 'Penthouse',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      description: 'Spacious penthouse with panoramic city views.',
      status: 'Available'
    }
  ];

  database.get('SELECT COUNT(*) AS count FROM properties', [], (countErr, countRow) => {
    if (countErr) {
      console.error('Could not count properties for seeding.', countErr.message);
      return;
    }

    if (countRow.count > 0) {
      return;
    }

    const insertSql = `
      INSERT INTO properties (title, location, price, type, bedrooms, bathrooms, area, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const statement = database.prepare(insertSql);

    sampleProperties.forEach((property) => {
      statement.run([
        property.title,
        property.location,
        property.price,
        property.type,
        property.bedrooms,
        property.bathrooms,
        property.area,
        property.description,
        property.status
      ]);
    });

    statement.finalize((finalizeErr) => {
      if (finalizeErr) {
        console.error('Could not seed sample properties.', finalizeErr.message);
        return;
      }

      console.log('Sample properties were added to an empty properties table.');
    });
  });
}

db.serialize(() => {
  ensurePropertiesTable(db);
  ensureUsersTable(db);
  addMissingPropertyColumns(db);
  migrateHousesIntoProperties(db);
  seedSampleProperties(db);
  seedDefaultAdminUser(db);
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate System API',
      version: '2.0.0',
      description: 'Beginner-friendly Swagger docs for the Real Estate System.'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local development server'
      }
    ]
  },
  apis: [path.join(__dirname, 'routes/*.js')]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.use(
  session({
    secret: 'real-estate-secret',
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  req.db = db;
  res.locals.isLoggedIn = Boolean(req.session.user);
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', propertyRoutes);
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
