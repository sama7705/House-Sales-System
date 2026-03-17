# Testing Guide

## Setup

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Manual Browser Tests

1. **Guest access**
   - Open `/`.
   - Property list should load.
   - Guest cannot add/sell/delete.

2. **Login success**
   - Open `/login` and use:
     - `admin@example.com`
     - `admin123`
   - Should redirect to `/`.

3. **Add property**
   - Open `/add-property`.
   - Submit all required fields (title, location, price, type, bedrooms, bathrooms, area).
   - Should redirect to `/` and show new property as Available.

4. **Property details**
   - Click a property title on `/`.
   - `/properties/:id` should show full details including description.

5. **Mark as sold**
   - Click **Mark as Sold**.
   - Status should become Sold.

6. **Delete property**
   - Click **Delete**.
   - Property should disappear from the list.

## API Checks (cURL)

### Get properties

```bash
curl -s http://localhost:3000/api/properties
```

### Create property

```bash
curl -i -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Beachfront Villa",
    "location":"Malibu, CA",
    "price":2500000,
    "type":"Villa",
    "bedrooms":5,
    "bathrooms":4,
    "area":420,
    "description":"Ocean view and private pool"
  }'
```

### Patch property

```bash
curl -i -X PATCH http://localhost:3000/api/properties/1 \
  -H "Content-Type: application/json" \
  -d '{"price":2600000,"status":"Available"}'
```

### Mark as sold

```bash
curl -i -X PATCH http://localhost:3000/api/properties/1/sold
```

### Delete property

```bash
curl -i -X DELETE http://localhost:3000/api/properties/1
```
