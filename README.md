# Store Rating Platform

A full-stack web app where users rate registered stores from 1 to 5. One login system serves three roles: **System Administrator**, **Normal User**, and **Store Owner**.

**Stack:** Express.js · PostgreSQL · React (Vite) · JWT auth

## Project Structure

```
store-rating/
├── backend/
│   ├── db/schema.sql          # tables, constraints, indexes
│   ├── db/seed.js             # creates default admin
│   └── src/
│       ├── config/db.js       # pg connection pool
│       ├── middleware/auth.js # JWT authenticate + role authorize
│       ├── utils/validators.js# express-validator rules
│       ├── utils/query.js     # whitelisted sorting + filtering helpers
│       ├── controllers/       # auth, admin, user, owner
│       ├── routes/index.js    # all API routes
│       └── server.js
└── frontend/
    └── src/
        ├── api/client.js      # axios + token interceptor
        ├── context/AuthContext.jsx
        ├── components/        # Navbar, ProtectedRoute, SortableTable, FormField
        ├── pages/             # Login, Signup, ChangePassword, AdminDashboard, UserStores, OwnerDashboard
        ├── hooks.js           # useList (server-side sort + filter)
        └── utils.js           # client-side validation rules
```

## Setup

### 1. Database
```bash
createdb store_rating
psql -d store_rating -f backend/db/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env     # edit DATABASE_URL and JWT_SECRET
npm install
npm run seed             # creates admin@example.com / Admin@123
npm run dev              # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Roles & Features

| Role | Capabilities |
|------|--------------|
| Admin | Dashboard (total users / stores / ratings); add users (any role) and stores; list + filter + sort users and stores; view user details (store owners show their rating) |
| Normal User | Sign up, log in; browse stores; search by name/address; submit and modify a 1-5 rating; change password |
| Store Owner | Log in; dashboard with average rating and list of users who rated; change password |

All roles can log out. All tables sort ascending/descending by clicking column headers.

## API Reference

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | /api/auth/signup | Public | Register a normal user |
| POST | /api/auth/login | Public | Login, returns JWT |
| PUT | /api/auth/password | Any logged in | Change password |
| GET | /api/admin/dashboard | Admin | Totals |
| GET/POST | /api/admin/users | Admin | List (filter: name, email, address, role; sort: sortBy, order) / create |
| GET | /api/admin/users/:id | Admin | User details (+ rating for owners) |
| GET/POST | /api/admin/stores | Admin | List (filters + sorting) / create |
| GET | /api/stores | User | Stores with overall + own rating (filter: name, address) |
| PUT | /api/stores/:storeId/rating | User | Submit or modify rating (upsert) |
| GET | /api/owner/dashboard | Owner | Store average + raters |

## Database Schema

- **users**: id, name, email (unique), password (bcrypt hash), address, role (ADMIN/USER/OWNER), created_at
- **stores**: id, name, email (unique), address, owner_id → users, created_at
- **ratings**: id, user_id → users, store_id → stores, rating (CHECK 1-5), timestamps, **UNIQUE (user_id, store_id)**

Indexes on ratings.store_id, stores.owner_id, users.role. Overall ratings are computed with AVG() at query time, so they never go stale.

## Validation (enforced on frontend and backend)

- Name: 20-60 characters
- Address: max 400 characters
- Password: 8-16 characters, at least one uppercase letter and one special character
- Email: standard format
- Rating: integer 1-5

## Security Practices

- Passwords hashed with bcrypt; JWT signed with a secret from env
- Role-based route guards on server (`authorize`) and client (`ProtectedRoute`)
- Parameterised SQL everywhere; sort columns whitelisted against injection
- CORS restricted to `CLIENT_URL`

## Notes

- Only the Admin can create Store Owner accounts and assign them to stores (an owner is linked via `stores.owner_id`).
- The seed script's default admin name is 20+ characters to satisfy the name rule. Change the admin password after first login.
