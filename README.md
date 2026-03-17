# Real Estate System

A simple Node.js project for managing property listings. Public users can browse properties, and an admin user can log in to add properties, mark them as sold, and delete them.

## Features

- List all properties on the home page
- Property details page (`/properties/:id`)
- Simple session-based admin login/logout
- Add a new property from a form (admin only)
- Mark a property as **Sold** (admin only)
- Delete a property (admin only)
- JSON API routes for testing/integration
- Swagger UI for interactive API testing

## Admin Login

- **Email:** `admin@example.com`
- **Password:** `admin123`

## Tech Stack

- **Node.js**
- **Express.js**
- **express-session**
- **SQLite3**
- **EJS**
- **Swagger UI + swagger-jsdoc**

## Project Structure

```text
House-Sales-System/
├─ app.js
├─ package.json
├─ routes/
│  ├─ properties.js
│  └─ api.js
├─ views/
│  ├─ index.ejs
│  ├─ add-property.ejs
│  ├─ property-details.ejs
│  ├─ login.ejs
│  └─ partials/
│     ├─ header.ejs
│     └─ footer.ejs
├─ public/
│  └─ style.css
└─ houses.db (SQLite file)
```

## Database Schema

Main table is now `properties`:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `title TEXT NOT NULL`
- `location TEXT NOT NULL`
- `price REAL NOT NULL`
- `type TEXT NOT NULL`
- `bedrooms INTEGER NOT NULL`
- `bathrooms INTEGER NOT NULL`
- `area REAL NOT NULL`
- `status TEXT NOT NULL DEFAULT 'Available'`
- `description TEXT`

## Main Web Routes

- `GET /` → list properties
- `GET /properties/:id` → property details page
- `GET /login`, `POST /login`, `POST /logout`
- `GET /add-property`, `POST /add-property` (admin only)
- `POST /sold/:id` (admin only)
- `POST /delete/:id` (admin only)

## Main API Routes

- `GET /api/properties`
- `GET /api/properties/:id`
- `POST /api/properties`
- `PATCH /api/properties/:id`
- `PATCH /api/properties/:id/sold`
- `DELETE /api/properties/:id`

## Run

```bash
npm install
npm start
```

Swagger docs:

```text
http://localhost:3000/api-docs
```
