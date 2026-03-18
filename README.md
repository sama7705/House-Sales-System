# Real Estate Management System

##  Project Description
A beginner-friendly real estate management system built with **Node.js**, **Express**, **SQLite**, and **EJS**. The application allows visitors to browse property listings through a simple web interface, while admins can log in to manage listings, update property status, and remove entries. It also includes a documented JSON API with **Swagger UI** for easy testing.

##  Project Objective
The goal of this project is to provide a practical full-stack example of a real estate platform that demonstrates:
- server-side rendering with EJS,
- property management with CRUD operations,
- session-based admin authentication,
- persistent storage with SQLite,
- and API documentation for learning and testing.

## Features

###  Public Features
- View all available property listings.
- Open a detailed page for each property.
- Search and filter properties by keyword, type, status, and price range.
- See key property details such as location, price, area, bedrooms, and bathrooms.

### Admin Features
- Secure admin login using session-based authentication.
- Add new property listings from a web form.
- Mark listed properties as **Sold**.
- Delete properties from the system.
- Manage listings through both the web interface and API.

### 🔌 API Features
- Get all properties as JSON.
- Get a single property by ID.
- Create a new property.
- Update a property partially with `PATCH`.
- Mark a property as sold.
- Delete a property.
- Explore and test endpoints with Swagger UI.

## Admin Login
Use the following demo credentials to access admin-only features:

- **Email:** `admin@example.com`
- **Password:** `admin123`

## Tech Stack

### Backend
- Node.js
- Express.js

### Frontend
- EJS
- HTML/CSS

### Database
- SQLite3

### Auth
- express-session

### API
- REST-style JSON endpoints
- swagger-jsdoc
- swagger-ui-express

## System Architecture

### Frontend Layer
- EJS templates render the user interface on the server.
- Public users can browse listings and view property details.
- Admin users can access protected management actions after login.

### Backend Layer
- Express handles routing, form submission, API responses, and session management.
- Separate route modules manage web routes and API routes.
- Validation checks help ensure required property data is provided.

### Database Layer
- SQLite stores property records in a local database file.
- The app creates the `properties` table automatically if it does not exist.
- Sample property data is inserted when the database is empty.

## Database Schema
The main table used in this project is:

- **properties**
  - `id` - Primary key
  - `title` - Property title
  - `location` - Property location
  - `price` - Property price
  - `type` - Property type
  - `bedrooms` - Number of bedrooms
  - `bathrooms` - Number of bathrooms
  - `area` - Property size
  - `status` - Availability status (`Available` or `Sold`)
  - `description` - Property description
  - `image_url` - Optional property image URL

## Web Routes

| Method | Route | Description |
|---|---|---|
| GET | `/` | Show the homepage with all property listings and filters |
| GET | `/properties/:id` | Show detailed information for one property |
| GET | `/login` | Show the admin login page |
| POST | `/login` | Authenticate the admin user |
| POST | `/logout` | Log out the current admin session |
| GET | `/add-property` | Show the add-property form for logged-in admins |
| POST | `/add-property` | Create a new property from the admin form |
| POST | `/sold/:id` | Mark a property as sold |
| POST | `/delete/:id` | Delete a property |

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/properties` | Return all properties as JSON, with optional filters |
| GET | `/api/properties/:id` | Return one property by ID |
| POST | `/api/properties` | Create a new property |
| PATCH | `/api/properties/:id` | Update selected property fields |
| PATCH | `/api/properties/:id/sold` | Mark a property as sold |
| DELETE | `/api/properties/:id` | Delete a property |

## Swagger Documentation
Interactive API documentation is available at:

**URL:** `http://localhost:3000/api-docs`

## How to Run
```bash
npm install
npm start
```

Then open:

- **Application:** `http://localhost:3000`
- **Swagger UI:** `http://localhost:3000/api-docs`

## Testing

### Web Testing
- Open the homepage and verify listings appear correctly.
- Test the search and filter options.
- Open a property details page.
- Log in as admin and test add, sold, and delete actions.
- Log out and confirm protected admin pages require login.

### Swagger / API Testing
- Open Swagger UI and test each API endpoint.
- Verify `GET` requests return valid property data.
- Test `POST` to create a new property.
- Test `PATCH` to update property fields.
- Test `PATCH /api/properties/:id/sold` to change the status.
- Test `DELETE` to remove a property.

### Edge Cases
- Try submitting missing required fields.
- Try using an invalid property ID.
- Try updating a property with invalid numeric values.
- Try logging in with incorrect admin credentials.
- Try accessing `/add-property` without logging in.

## Frontend Design
The frontend is designed to be clean and simple for beginners:
- A homepage with property cards and filter controls.
- A dedicated details page for each property.
- A straightforward admin login page.
- An easy-to-use form for adding new properties.
- Clear status labels to distinguish **Available** and **Sold** listings.

## System Workflow
1. The server starts and connects to the SQLite database.
2. The app ensures the `properties` table exists.
3. Sample properties are added if the database is empty.
4. Visitors browse listings on the homepage.
5. Users can open a property details page for more information.
6. Admins log in using the demo credentials.
7. Logged-in admins can add, update, sell, or delete properties.
8. API consumers can interact with the same property data through JSON endpoints.
9. Swagger UI provides a simple interface for testing the API.

## Notes
- This project uses **session-based authentication** for admin access.
- Property data is stored locally in `houses.db`.
- The system is designed to be simple, readable, and beginner-friendly.
- Swagger documentation is included to make API learning easier.

## Author
Sama Mohamed Maher