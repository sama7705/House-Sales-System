const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const houseRoutes = require('./routes/houses');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/', houseRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
