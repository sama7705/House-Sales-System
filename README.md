# House Sales System

A simple Node.js project for managing house listings. You can view houses, add new ones, mark houses as sold, and delete houses using either web pages or API routes.

## Features

- List all houses on the home page
- Add a new house from a form
- Mark a house as **Sold**
- Delete a house
- Use JSON API routes for testing or integration
- Use Swagger UI for interactive API testing

## Tech Stack

- **Node.js**
- **Express.js**
- **SQLite3**
- **EJS** (server-side templates)
- **Swagger UI + swagger-jsdoc**

## Project Structure

```text
House-Sales-System/
├─ app.js
├─ package.json
├─ routes/
│  └─ houses.js
├─ views/
│  ├─ index.ejs
│  └─ add-house.ejs
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

## Main Pages and API Routes

### Browser pages

- `GET /` → home page with house list
- `GET /add` → add-house form page
- `POST /add` → submit add-house form
- `POST /sold/:id` → mark house as sold from UI
- `POST /delete/:id` → delete house from UI

### API routes

- `GET /api/houses` → list houses (JSON)
- `POST /api/houses` → create a house (JSON)
- `GET /api/houses/:id` → get one house by ID (JSON)
- `PATCH /api/houses/:id` → update one house (JSON)
- `PATCH /api/houses/:id/sold` → mark a house as sold (JSON)
- `DELETE /api/houses/:id` → delete a house (JSON)
