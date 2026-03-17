# Testing Guide

This guide shows practical manual and API tests for first-time users.

## Before You Start

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the app in browser:

```text
http://localhost:3000
```

---

## Manual Testing (Browser)

### 1) Listing houses

1. Open `http://localhost:3000/`.
2. Confirm the table/page loads.
3. Expected result:
   - Existing houses are shown.
   - If there are no houses yet, list is empty but page still works.

### 2) Adding a house

1. Open `http://localhost:3000/add`.
2. Fill in the form:
   - Title: `Sunny Villa`
   - Location: `Miami, FL`
   - Price: `550000`
3. Submit.
4. Expected result:
   - You are redirected to `/`.
   - New house appears in the list with status **Available**.

### 3) Marking a house as sold

1. On home page (`/`), choose a house.
2. Click the **Sold** action/button for that row.
3. Expected result:
   - Page reloads.
   - House status changes to **Sold**.

### 4) Deleting a house

1. On home page (`/`), choose a house.
2. Click **Delete**.
3. Expected result:
   - Page reloads.
   - House is removed from the list.

---

## API Testing with Swagger UI

1. Open Swagger UI:

```text
http://localhost:3000/api-docs
```

2. Test endpoints in this order:
   - `GET /api/houses`
   - `POST /api/houses`
   - `PATCH /api/houses/{id}/sold`
   - `DELETE /api/houses/{id}`

### Sample request body (POST /api/houses)

```json
{
  "title": "City Apartment",
  "location": "Austin, TX",
  "price": 320000
}
```

### Expected API results

- `GET /api/houses` → `200 OK` with an array.
- `POST /api/houses` → `201 Created` with new house JSON.
- `PATCH /api/houses/{id}/sold` → `200 OK` and success message.
- `DELETE /api/houses/{id}` → `200 OK` and success message.

---

## Edge Cases to Test

### 1) Empty fields

#### Browser form (`POST /add`)

- Leave title/location/price empty and submit.
- Expected: validation error message on form (HTTP 400).

#### API (`POST /api/houses`)

Use invalid body:

```json
{
  "title": "",
  "location": "",
  "price": ""
}
```

Expected: `400 Bad Request`.

### 2) Invalid ID

Test:

- `PATCH /api/houses/999999/sold`
- `DELETE /api/houses/999999`

Expected: `404 Not Found` with `House not found`.

### 3) Duplicate-looking entries

Create two houses with same title/location/price.

Expected:

- Both are allowed (no uniqueness rule in current app).
- Each entry has a different `id`.
