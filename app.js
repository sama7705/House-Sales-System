const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const houseRoutes = require('./routes/houses');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

const dbPath = path.join(__dirname, 'houses.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS houses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available'
    )
  `);
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'House Sales System API',
      version: '1.0.0',
      description: 'Beginner-friendly Swagger docs for the House Sales System.'
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

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', houseRoutes);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
