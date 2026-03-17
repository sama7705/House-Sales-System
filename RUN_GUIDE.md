# Run Guide

This guide helps you run the House Sales System on your local machine.

## Prerequisites

Make sure you have:

- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)

Check your versions:

```bash
node -v
npm -v
```

## Install Dependencies

In the project folder, run:

```bash
npm install
```

## Start the Server

Run in normal mode:

```bash
npm start
```

Run in development mode (auto-restart on file changes):

```bash
npm run dev
```

## Default Port

The server runs on:

```text
3000
```

So your base URL is:

```text
http://localhost:3000
```

## Access Browser Pages

Open these URLs in your browser:

- Home/list page: `http://localhost:3000/`
- Add-house page: `http://localhost:3000/add`

## Access Swagger Docs

Open:

- `http://localhost:3000/api-docs`

From there, you can test API endpoints directly.

## Common Issues and Quick Fixes

### 1) `npm install` fails

- Check internet connection.
- Check Node.js version (`node -v`).
- Try deleting `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2) `EADDRINUSE: address already in use :::3000`

Another app is already using port 3000.

Quick options:

- Stop the other app using port 3000.
- Or change the `PORT` value in `app.js`.

### 3) `Cannot GET /` or blank page

- Make sure the server is running and shows no startup error.
- Open exactly `http://localhost:3000/`.
- Check terminal logs for database or template errors.

### 4) Database seems empty after restart

- `houses.db` is a local SQLite file.
- If you delete it, data is reset.
- Make sure you are running from the correct project folder.
