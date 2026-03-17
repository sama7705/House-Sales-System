const path = require('path');
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

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
      description TEXT
    )
  `);
}

function addMissingPropertyColumns(database) {
  const requiredColumns = [
    { name: 'type', sql: "ALTER TABLE properties ADD COLUMN type TEXT NOT NULL DEFAULT 'House'" },
    { name: 'bedrooms', sql: 'ALTER TABLE properties ADD COLUMN bedrooms INTEGER NOT NULL DEFAULT 0' },
    { name: 'bathrooms', sql: 'ALTER TABLE properties ADD COLUMN bathrooms INTEGER NOT NULL DEFAULT 0' },
    { name: 'area', sql: 'ALTER TABLE properties ADD COLUMN area REAL NOT NULL DEFAULT 0' },
    { name: 'description', sql: 'ALTER TABLE properties ADD COLUMN description TEXT' }
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

db.serialize(() => {
  ensurePropertiesTable(db);
  addMissingPropertyColumns(db);
  migrateHousesIntoProperties(db);
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
app.use(express.static(path.join(__dirname, 'public')));

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
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', propertyRoutes);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
