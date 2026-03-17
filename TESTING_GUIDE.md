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

## API Testing with Swagger UI (Step-by-Step)

### Open Swagger UI

1. Make sure the server is running (`npm start`).
2. Open:

```text
http://localhost:3000/api-docs
```

3. Expand the **API** tag section.
4. For each endpoint, click **Try it out**, provide values, then click **Execute**.

### Recommended execution flow

Use these endpoints in order so each step has data from the previous step:

1. `GET /api/houses` (baseline list)
2. `POST /api/houses` (create a test house)
3. `GET /api/houses/{id}` (verify created house)
4. `PATCH /api/houses/{id}` (partial update test)
5. `PATCH /api/houses/{id}/sold` (mark sold)
6. `DELETE /api/houses/{id}` (cleanup)

> Tip: Copy the `id` returned by `POST /api/houses`; you will reuse it in later requests.

### Example JSON request bodies

#### `POST /api/houses`

```json
{
  "title": "City Apartment",
  "location": "Austin, TX",
  "price": 320000
}
```

#### `PATCH /api/houses/{id}` (update one or more fields)

```json
{
  "price": 335000,
  "status": "Available"
}
```

#### Alternative `PATCH /api/houses/{id}` example

```json
{
  "title": "City Apartment - Renovated",
  "location": "Austin, TX",
  "price": 350000,
  "status": "Sold"
}
```

### Expected responses

#### `GET /api/houses`

- Status: `200 OK`
- Body (array, may be empty):

```json
[
  {
    "id": 1,
    "title": "City Apartment",
    "location": "Austin, TX",
    "price": 320000,
    "status": "Available"
  }
]
```

#### `POST /api/houses`

- Status: `201 Created`
- Body:

```json
{
  "id": 2,
  "title": "City Apartment",
  "location": "Austin, TX",
  "price": 320000,
  "status": "Available"
}
```

#### `GET /api/houses/{id}`

- Status: `200 OK` when id exists
- Body:

```json
{
  "id": 2,
  "title": "City Apartment",
  "location": "Austin, TX",
  "price": 320000,
  "status": "Available"
}
```

#### `PATCH /api/houses/{id}`

- Status: `200 OK`
- Body (updated object):

```json
{
  "id": 2,
  "title": "City Apartment - Renovated",
  "location": "Austin, TX",
  "price": 350000,
  "status": "Sold"
}
```

#### `PATCH /api/houses/{id}/sold`

- Status: `200 OK`
- Body:

```json
{
  "message": "House marked as sold"
}
```

#### `DELETE /api/houses/{id}`

- Status: `200 OK`
- Body:

```json
{
  "message": "House deleted successfully"
}
```

---

## Edge Cases to Test

### 1) Empty fields

#### Browser form (`POST /add`)

1. Open `http://localhost:3000/add`.
2. Leave **Title**, **Location**, and/or **Price** blank.
3. Submit.
4. Expected result: validation error on the form (`400`).

#### API (`POST /api/houses`)

Use this invalid request body:

```json
{
  "title": "",
  "location": "",
  "price": ""
}
```

Expected response:

- Status: `400 Bad Request`
- Body:

```json
{
  "error": "Title, location, and valid price are required."
}
```

### 2) Invalid ID

Use a non-existent id such as `999999`.

#### `GET /api/houses/{id}`

- Request: `GET /api/houses/999999`
- Expected:
  - Status: `404 Not Found`
  - Body:

```json
{
  "error": "House not found"
}
```

#### `PATCH /api/houses/{id}`

- Request: `PATCH /api/houses/999999`
- Example body:

```json
{
  "status": "Sold"
}
```

- Expected:
  - Status: `404 Not Found`
  - Body:

```json
{
  "error": "House not found"
}
```

#### `PATCH /api/houses/{id}/sold`

- Request: `PATCH /api/houses/999999/sold`
- Expected:
  - Status: `404 Not Found`
  - Body:

```json
{
  "error": "House not found"
}
```

#### `DELETE /api/houses/{id}`

- Request: `DELETE /api/houses/999999`
- Expected:
  - Status: `404 Not Found`
  - Body:

```json
{
  "error": "House not found"
}
```

### 3) Additional negative API checks (optional but recommended)

#### Missing patch fields

- Request: `PATCH /api/houses/{id}` with empty body `{}`
- Expected:
  - Status: `400 Bad Request`
  - Body:

```json
{
  "error": "Provide at least one field to update."
}
```

#### Invalid patch status

- Request body:

```json
{
  "status": "Pending"
}
```

- Expected:
  - Status: `400 Bad Request`
  - Body:

```json
{
  "error": "Status must be Available or Sold."
}
```

#### Invalid patch price

- Request body:

```json
{
  "price": "not-a-number"
}
```

- Expected:
  - Status: `400 Bad Request`
  - Body:

```json
{
  "error": "Price must be a valid number."
}
```
