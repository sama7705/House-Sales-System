# Run Guide

This guide helps you run the Real Estate System.

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Install

```bash
npm install
```

## Start

```bash
npm start
```

Development mode:

```bash
npm run dev
```

## URLs

- App: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- Login: `http://localhost:3000/login`

## Admin Account

- Email: `admin@example.com`
- Password: `admin123`

## Main Pages

- Home (property list): `/`
- Add property (login required): `/add-property`
- Property details: `/properties/:id`

## Notes on Database Migration

On startup, the app ensures a `properties` table exists with the new schema. If an old `houses` table exists and `properties` is empty, old records are copied into `properties` with default values for new fields.
