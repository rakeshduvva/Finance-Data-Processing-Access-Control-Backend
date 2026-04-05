# Finance Data Processing & Access Control Backend

A comprehensive backend system for a finance dashboard with role-based access control (RBAC), financial records management, and analytical dashboard APIs.

---

## Overview

This backend serves as the API layer for a finance dashboard system where different users interact with financial records based on their role.

The system supports:

- **User & Role Management** — Create, update, and manage users with role-based access
- **Financial Records** — Full CRUD with filtering, pagination, sorting, and soft delete
- **Dashboard Analytics** — Summary totals, category breakdowns, monthly trends, recent activity
- **Access Control** — Middleware-based RBAC enforcing permissions per role
- **Input Validation** — Zod schema validation with descriptive error messages
- **API Documentation** — Interactive Swagger UI

---

## Tech Stack

| Component | Technology |
| --- | --- |
| Runtime | Node.js 18+ |
| Framework | Express.js |
| ORM | Prisma |
| Database | SQLite |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |
| Documentation | Swagger (OpenAPI 3.0) |
| Testing | Jest + Supertest |
| Security | Helmet, CORS, Rate Limiting |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

1. Clone the repository

```bash
git clone https://github.com/rakeshduvva/Finance-Data-Processing-Access-Control-Backend.git
cd Finance-Data-Processing-Access-Control-Backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

On Windows use:

```bash
copy .env.example .env
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Generate Prisma client

```bash
npx prisma generate
```

6. Seed the database with sample data

```bash
npm run seed
```

7. Start the development server

```bash
npm run dev
```

### Quick Start URLs

| Resource | URL |
| --- | --- |
| API Server | `http://localhost:3000` |
| Swagger Docs | `http://localhost:3000/api-docs` |
| Health Check | `http://localhost:3000/api/health` |

### Default Seed Users

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `password123` |
| Analyst | `analyst@example.com` | `password123` |
| Viewer | `viewer@example.com` | `password123` |
| Inactive | `inactive@example.com` | `password123` |

---

## Project Structure

```
├── prisma/
│   ├── migrations/                # Database migration history
│   └── schema.prisma              # Database schema definition
├── src/
│   ├── config/
│   │   └── index.js               # Centralized configuration
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication
│   │   ├── authorize.js           # Role-based authorization
│   │   ├── validate.js            # Zod validation middleware
│   │   ├── errorHandler.js        # Global error handler
│   │   └── rateLimiter.js         # Rate limiting
│   ├── modules/
│   │   ├── auth/                  # Authentication (register, login, profile)
│   │   ├── users/                 # User management (admin CRUD)
│   │   ├── records/               # Financial records (CRUD + filtering)
│   │   └── dashboard/             # Analytics and summaries
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Standardized response wrapper
│   │   └── prisma.js              # Prisma client singleton
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point
├── tests/
│   └── api.test.js                # Integration tests
├── seed.js                        # Database seeder
├── .env.example                   # Environment template
├── package.json
└── README.md
```

The project follows a **modular architecture** — each module has its own controller (HTTP), service (business logic), routes (endpoints), and validation (input schemas).

---

## API Documentation

### Interactive Docs

Start the server and visit `http://localhost:3000/api-docs` for interactive Swagger documentation.

### Auth Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and get JWT token |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |

### User Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users` | Admin | List all users (paginated, filterable) |
| `GET` | `/api/users/:id` | Admin | Get user by ID |
| `PATCH` | `/api/users/:id` | Admin | Update user (role, status, name) |
| `DELETE` | `/api/users/:id` | Admin | Deactivate user |

### Financial Record Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/records` | Admin | Create a financial record |
| `GET` | `/api/records` | Analyst, Admin | List records (filtered, paginated) |
| `GET` | `/api/records/:id` | Analyst, Admin | Get single record |
| `PATCH` | `/api/records/:id` | Admin | Update record |
| `DELETE` | `/api/records/:id` | Admin | Soft-delete record |

**Available Filters:**

```
GET /api/records?type=INCOME&category=Salary&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20&sortBy=date&order=desc&search=keyword
```

### Dashboard Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard/summary` | All roles | Total income, expenses, net balance |
| `GET` | `/api/dashboard/category-summary` | Analyst, Admin | Category-wise breakdown |
| `GET` | `/api/dashboard/trends` | Analyst, Admin | Monthly income/expense trends |
| `GET` | `/api/dashboard/recent-activity` | All roles | Recent financial records |

---

## Response Format

All API responses follow a consistent format.

**Success:**

```json
{
  "success": true,
  "message": "Description of what happened",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Error:**

```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "location": "body"
    }
  ]
}
```

---

## Authentication & Authorization

### Authentication

The API uses JWT (JSON Web Tokens). After logging in, include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control

| Action | Viewer | Analyst | Admin |
| --- | --- | --- | --- |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View category breakdown | ❌ | ✅ | ✅ |
| View trends | ❌ | ✅ | ✅ |
| List and view records | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

Access control is implemented as Express middleware that checks the user's role against allowed roles per route.

---

## Database Schema

```
┌──────────────────┐         ┌──────────────────────┐
│      User        │         │  FinancialRecord     │
├──────────────────┤         ├──────────────────────┤
│ id (PK, UUID)    │───┐     │ id (PK, UUID)        │
│ name             │   │     │ amount               │
│ email (unique)   │   │     │ type (INCOME/EXPENSE)│
│ password (hash)  │   │     │ category             │
│ role (enum)      │   └────>│ createdById (FK)     │
│ isActive         │         │ date                 │
│ createdAt        │         │ description          │
│ updatedAt        │         │ isDeleted            │
└──────────────────┘         │ createdAt            │
                             │ updatedAt            │
                             └──────────────────────┘
```

- **SQLite** for zero-configuration setup
- **Prisma ORM** for type-safe queries and migrations
- **Soft delete** via `isDeleted` flag to preserve data integrity

---

## Testing

Run the test suite:

```bash
npm test
```

The suite includes **32 integration tests** covering:

- User registration, login, and token validation
- Role-based access enforcement for all roles
- Financial record CRUD operations
- Record filtering and pagination
- Soft delete behavior
- Dashboard analytics endpoints
- Input validation and error responses
- Health check and 404 handling

---

## Design Decisions & Assumptions

### Architecture

1. **Modular Structure** — Each feature is a self-contained module with controller, service, routes, and validation
2. **Service Layer Pattern** — Business logic isolated from HTTP concerns for testability
3. **Middleware-Based RBAC** — Composable `authenticate` and `authorize(roles)` middleware
4. **Standardized Responses** — `ApiResponse` and `ApiError` classes for consistent output

### Assumptions

1. Registration is open (in production, admin-only or email verification would be used)
2. Role can be specified at registration for testing convenience
3. Single-tenant system — all users share the same records pool
4. Financial records are soft-deleted to preserve audit trails
5. All dates stored in UTC

### Security

- Password hashing with bcrypt (12 salt rounds)
- Helmet for HTTP security headers
- Rate limiting: 100 req/15min (API), 20 req/15min (auth)
- Zod input validation on all endpoints
- JWT tokens with 7-day expiration
- JSON body size limited to 10KB

---

## Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| Start | `npm start` | Run production server |
| Dev | `npm run dev` | Start with auto-reload |
| Seed | `npm run seed` | Populate sample data |
| Test | `npm test` | Run integration tests |
| Prisma Generate | `npm run prisma:generate` | Regenerate Prisma client |
| Prisma Migrate | `npm run prisma:migrate` | Run database migrations |
| Prisma Studio | `npm run prisma:studio` | Open database GUI |

---

## License

ISC