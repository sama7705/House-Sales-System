# House Sales System

A beginner-friendly **Real Estate / House Listings** web app built with Node.js and Express.
It includes a public browsing experience and an admin workflow for managing property listings.

---

## ✨ Overview

This project is designed as a portfolio-ready full-stack starter:

- Server-rendered pages with **EJS**
- Persistent data using **SQLite**
- Session-based admin authentication
- REST-style JSON API for integration/testing
- Interactive API documentation via Swagger

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Server | Express.js |
| Views | EJS |
| Database | SQLite3 |
| Auth Session | express-session |
| API Docs | swagger-ui-express + swagger-jsdoc |

---

## 🚀 Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Start the app

```bash
npm start
```

### 3) Open in browser

```text
App:     http://localhost:3000
Swagger: http://localhost:3000/api-docs
```

---

## 🔐 Admin Access (Demo)

Use these credentials to access admin-only actions:

- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## ✅ Public Features

- Browse all property listings
- View detailed information for each property
- Filter/search properties (via query params and API)
- View status (Available / Sold)

## 🛠️ Admin Features

- Log in / log out
- Add new property listings
- Mark properties as **Sold**
- Delete properties
- Create and update properties via API

---

## 🌐 Web Routes

### Public Routes

| Method | Route | Description |
|---|---|---|
| GET | `/` | Home page with property list |
| GET | `/properties/:id` | Property details page |
| GET | `/login` | Admin login page |
| POST | `/login` | Submit admin login |
| POST | `/logout` | Admin logout |

### Admin-Protected Routes

| Method | Route | Description |
|---|---|---|
| GET | `/add-property` | Form to add a new property |
| POST | `/add-property` | Create a new property |
| POST | `/sold/:id` | Mark a property as sold |
| POST | `/delete/:id` | Delete a property |

---

## 📡 API Routes (JSON)

| Method | Route | Description |
|---|---|---|
| GET | `/api/properties` | List properties |
| GET | `/api/properties/:id` | Get one property |
| POST | `/api/properties` | Create a property |
| PATCH | `/api/properties/:id` | Partially update a property |
| PATCH | `/api/properties/:id/sold` | Mark property as sold |
| DELETE | `/api/properties/:id` | Delete a property |

> Tip: Use Swagger UI at `/api-docs` to test API endpoints interactively.

---

## 🗃️ Database Notes

The app uses a SQLite database file (`houses.db`) and ensures a `properties` table exists at startup.

Key fields include:

- `id`, `title`, `location`, `price`
- `type`, `bedrooms`, `bathrooms`, `area`
- `status` (`Available` or `Sold`)
- `description`, `image_url`

---

## 📁 Project Structure

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
└─ houses.db
```

---

## 🎯 Portfolio Value

This project demonstrates practical, beginner-friendly skills:

- CRUD operations with a real database
- Route design for both UI and API
- Session-based authentication flow
- Server-side rendering with reusable views
- API documentation and testing workflow

If you're building your portfolio, this is a solid base to extend with:

- image uploads
- role-based access
- deployment (Render/Railway/Fly)
- automated tests

