# House Sales System (Node.js + Express + SQLite + EJS)

A very small, beginner-friendly house sales system.

## Features

1. Show all houses on the home page
2. Add a new house
3. Mark a house as sold
4. Delete a house
5. Show status as Available or Sold

## Project Structure

- `app.js`
- `package.json`
- `houses.db` (created automatically on first run if it doesn't exist)
- `routes/`
- `views/`
  - `partials/`
  - `index.ejs`
  - `add-house.ejs`
- `public/`
  - `style.css`

## Installation

```bash
npm install
```

## Run

```bash
npm start
```

Open: `http://localhost:3000`

## Database

Database file: `houses.db`

Table: `houses`

Columns:
- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `title TEXT NOT NULL`
- `location TEXT NOT NULL`
- `price REAL NOT NULL`
- `status TEXT NOT NULL DEFAULT 'Available'`
