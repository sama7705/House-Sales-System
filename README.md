# House Sales System

A simple Node.js project for managing house listings. Public users can view properties, and an admin user can log in to add houses, mark houses as sold, and delete houses.

## Features

- List all houses on the home page
- Simple session-based admin login/logout
- Add a new house from a form (admin only)
- Mark a house as **Sold** (admin only)
- Delete a house (admin only)
- Use JSON API routes for testing or integration
- Use Swagger UI for interactive API testing

## Admin Login (for now)

The app currently uses one hardcoded admin account:

- **Email:** `admin@example.com`
- **Password:** `admin123`

No registration is included yet.

## Tech Stack

- **Node.js**
- **Express.js**
- **express-session**
- **SQLite3**
- **EJS** (server-side templates)
- **Swagger UI + swagger-jsdoc**

## Project Structure

```text
House-Sales-System/
├─ app.js
├─ package.json
├─ routes/
│  ├─ houses.js
│  └─ api.js
├─ views/
│  ├─ index.ejs
│  ├─ add-house.ejs
│  ├─ login.ejs
│  └─ partials/
│     ├─ header.ejs
│     └─ footer.ejs
├─ public/
│  └─ style.css
└─ houses.db (auto-created on first run)
```

## How to Install

1. Open a terminal in the project folder.
2. Install dependencies:

```bash
npm install
```

## How to Run

Start the app:

```bash
npm start
```

For auto-reload during development:

```bash
npm run dev
```

Server URL:

```text
http://localhost:3000
```

## Swagger Docs URL

```text
http://localhost:3000/api-docs
```

## Main Web Routes

- `GET /` → home page with house list (public)
- `GET /login` → login page
- `POST /login` → login action
- `POST /logout` → logout action
- `GET /add` → add-house form page (**admin only**)
- `POST /add` → submit add-house form (**admin only**)
- `POST /sold/:id` → mark house as sold (**admin only**)
- `POST /delete/:id` → delete house (**admin only**)

If a guest user opens a protected route, they are redirected to `/login`.

## Main API Routes

- `GET /api/houses` → list houses (JSON)
- `POST /api/houses` → create a house (JSON)
- `GET /api/houses/:id` → get one house by ID (JSON)
- `PATCH /api/houses/:id` → update one house (JSON)
- `PATCH /api/houses/:id/sold` → mark a house as sold (JSON)
- `DELETE /api/houses/:id` → delete a house (JSON)
