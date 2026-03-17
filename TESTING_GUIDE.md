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

### 1) Public listing still works

1. Open `http://localhost:3000/`.
2. Confirm the table/page loads without login.
3. Expected result:
   - Existing houses are shown.
   - Add and management actions are hidden/disabled for guests.

### 2) Login success

1. Open `http://localhost:3000/login`.
2. Sign in with:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Expected result:
   - Redirect to `/`.
   - Navigation now shows **Add House** and **Logout**.

### 3) Login failure

1. Open `http://localhost:3000/login`.
2. Enter wrong credentials.
3. Expected result:
   - Stay on login page.
   - Error: `Invalid email or password.`

### 4) Route protection

1. Log out (or use an incognito window).
2. Try opening `http://localhost:3000/add`.
3. Expected result:
   - Redirect to `/login`.

### 5) Adding a house (admin only)

1. Login as admin.
2. Open `http://localhost:3000/add`.
3. Fill in the form:
   - Title: `Sunny Villa`
   - Location: `Miami, FL`
   - Price: `550000`
4. Submit.
5. Expected result:
   - Redirect to `/`.
   - New house appears with status **Available**.

### 6) Marking a house as sold (admin only)

1. Login as admin.
2. On home page (`/`), choose a house.
3. Click **Mark as Sold**.
4. Expected result:
   - Page reloads.
   - House status changes to **Sold**.

### 7) Deleting a house (admin only)

1. Login as admin.
2. On home page (`/`), choose a house.
3. Click **Delete**.
4. Expected result:
   - Page reloads.
   - House is removed from the list.

### 8) Logout

1. While logged in, click **Logout**.
2. Expected result:
   - Redirect to `/login`.
   - Protected pages are no longer available until login.

---

## API Testing with Swagger UI

The JSON API endpoints are unchanged and still public.

1. Make sure server is running (`npm start`).
2. Open `http://localhost:3000/api-docs`.
3. Test API routes under the **API** tag.
4. You can also view new web auth route docs under the **Web** tag:
   - `GET /login`
   - `POST /login`
   - `POST /logout`

---

## Quick cURL Checks for Login/Logout

Use these commands in another terminal while server is running.

### Login with valid credentials

```bash
curl -i -c cookie.txt -X POST http://localhost:3000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@example.com&password=admin123"
```

Expected: `302` redirect to `/` and session cookie saved.

### Access protected route with session cookie

```bash
curl -i -b cookie.txt http://localhost:3000/add
```

Expected: `200` with add-house HTML.

### Logout

```bash
curl -i -b cookie.txt -X POST http://localhost:3000/logout
```

Expected: `302` redirect to `/login`.

### Protected route without login

```bash
curl -i http://localhost:3000/add
```

Expected: `302` redirect to `/login`.
