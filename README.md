# Finance Data Processing & Access Control Backend

A comprehensive backend system for a finance dashboard with role-based access control (RBAC), financial records management, and analytical dashboard APIs.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Design Decisions & Assumptions](#design-decisions--assumptions)

---

## Overview

This backend serves as the API layer for a finance dashboard system where different users interact with financial records based on their role. The system supports:

- **User & Role Management** — Create, update, and manage users with role-based access
- **Financial Records** — Full CRUD with filtering, pagination, sorting, and soft delete
- **Dashboard Analytics** — Summary totals, category breakdowns, monthly trends, recent activity
- **Access Control** — Middleware-based RBAC enforcing permissions per role
- **Input Validation** — Zod schema validation with descriptive error messages
- **API Documentation** — Interactive Swagger UI

---

## Tech Stack

| Component | Technology |
|---|---|
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

```bash
# 1. Clone the repository
git clone <repo-url>
cd finance-dashboard-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# (On Windows: copy .env.example .env)
# Edit .env if you want to customize settings

# 4. Run database migrations
npx prisma migrate dev

# 5. Generate Prisma client
npx prisma generate

# 6. Seed the database with sample data
npm run seed

# 7. Start the development server
npm run dev
```

### Quick Start URLs

| Resource | URL |
|---|---|
| API Server | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/api/health |

### Default Seed Users

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password123 |
| Analyst | analyst@example.com | password123 |
| Viewer | viewer@example.com | password123 |
| Inactive | inactive@example.com | password123 |

---

## Project Structure

```
├── prisma/
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
│   │   └── dashboard/             # Analytics & summaries
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Standardized response wrapper
│   │   └── prisma.js              # Prisma client singleton
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point
├── tests/
│   └── api.test.js                # Integration tests
├── seed.js                        # Database seeder
├── .env                           # Environment configuration
├── .gitignore
├── package.json
└── README.md
```

**Architecture**: The project follows a **modular architecture** with clear separation of concerns — each module has its own controller (handles HTTP), service (business logic), routes (endpoint definitions), and validation (input schemas).

---

## API Documentation

### Interactive Docs

Start the server and visit **http://localhost:3000/api-docs** for interactive Swagger documentation where you can test all endpoints directly.

### Endpoints Summary

#### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| GET | `/api/auth/me` | Authenticated | Get current user profile |

#### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users (paginated, filterable) |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PATCH | `/api/users/:id` | Admin | Update user (role, status, name) |
| DELETE | `/api/users/:id` | Admin | Deactivate user |

#### Financial Records (`/api/records`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/records` | Admin | Create a financial record |
| GET | `/api/records` | Analyst, Admin | List records (filtered, paginated) |
| GET | `/api/records/:id` | Analyst, Admin | Get single record |
| PATCH | `/api/records/:id` | Admin | Update record |
| DELETE | `/api/records/:id` | Admin | Soft-delete record |

**Available Filters**: `?type=INCOME&category=Salary&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20&sortBy=date&order=desc&search=keyword`

#### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | All roles | Total income, expenses, net balance |
| GET | `/api/dashboard/category-summary` | Analyst, Admin | Category-wise breakdown |
| GET | `/api/dashboard/trends` | Analyst, Admin | Monthly income/expense trends |
| GET | `/api/dashboard/recent-activity` | All roles | Recent financial records |

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Description of what happened",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Error Response:**
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

The API uses **JWT (JSON Web Tokens)** for authentication. After logging in, include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control (RBAC)

Three roles with hierarchical permissions:

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View category breakdown | ❌ | ✅ | ✅ |
| View trends | ❌ | ✅ | ✅ |
| List/view records | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

Access control is implemented as **Express middleware** (`authorize.js`) that checks the authenticated user's role against the allowed roles for each route.

---

## Database Schema

### Entity Relationship

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

- **SQLite** chosen for zero-configuration setup — no external database server needed
- **Prisma ORM** provides type-safe queries and automatic migrations
- **Soft delete** with `isDeleted` flag preserves data integrity

---

## Testing

Run the full test suite:

```bash
npm test
```

### Test Coverage

The test suite includes **25+ integration tests** covering:

- ✅ User registration and login
- ✅ Input validation and error responses
- ✅ JWT token generation and verification
- ✅ Role-based access enforcement (viewer, analyst, admin)
- ✅ Financial record CRUD operations
- ✅ Record filtering and pagination
- ✅ Soft delete behavior
- ✅ Dashboard summary, categories, trends
- ✅ Health check and 404 handling
- ✅ Duplicate email prevention
- ✅ Invalid credentials rejection

---

## Design Decisions & Assumptions

### Architecture Decisions

1. **Modular Structure**: Each feature (auth, users, records, dashboard) is organized as a self-contained module with its own controller, service, routes, and validation. This promotes separation of concerns and maintainability.

2. **Service Layer Pattern**: Business logic is isolated in service classes, keeping controllers thin and focused on HTTP concerns. This makes the logic testable and reusable.

3. **Middleware-Based RBAC**: Access control is implemented as composable Express middleware (`authenticate` → `authorize(roles)`), allowing clean and declarative route protection.

4. **Standardized Responses**: All API responses use `ApiResponse` and `ApiError` classes for consistent format, making the API predictable for frontend consumers.

5. **Zod Validation**: Input validation schemas are co-located with their modules and provide descriptive, field-level error messages.

### Assumptions

1. **Registration is open**: Any user can register (in production, admin-only registration or email verification would be implemented).
2. **Role assignment at registration**: Users can specify their role during registration for testing convenience. In production, this would be admin-controlled.
3. **Single-tenant**: The system doesn't have organization/tenant isolation — all users share the same financial records pool.
4. **Soft delete only**: Financial records are soft-deleted (marked with `isDeleted: true`) rather than permanently removed, preserving audit trails.
5. **UTC dates**: All dates are stored and returned in UTC format.

### Tradeoffs

| Decision | Benefit | Tradeoff |
|---|---|---|
| SQLite over PostgreSQL | Zero-config setup, portable | No concurrent writes at scale |
| JWT over sessions | Stateless, horizontally scalable | Can't revoke tokens without blocklist |
| Soft delete | Data recovery, audit trail | Query complexity (must filter `isDeleted`) |
| Monolithic structure | Simplicity for assessment scope | Would benefit from microservices at scale |

### Security Measures

- **Password hashing**: bcrypt with 12 salt rounds
- **Helmet**: HTTP security headers
- **Rate limiting**: 100 req/15min (API), 20 req/15min (auth)
- **Input validation**: All endpoints validated with Zod
- **JWT expiration**: Tokens expire after 7 days
- **JSON body size limit**: 10KB max to prevent payload attacks

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Start | `npm start` | Run production server |
| Dev | `npm run dev` | Start with auto-reload |
| Seed | `npm run seed` | Populate database with sample data |
| Test | `npm test` | Run integration tests |
| Prisma Generate | `npm run prisma:generate` | Regenerate Prisma client |
| Prisma Migrate | `npm run prisma:migrate` | Run database migrations |
| Prisma Studio | `npm run prisma:studio` | Open database GUI |

---

## License

ISC
#   F i n a n c e - D a t a - P r o c e s s i n g - A c c e s s - C o n t r o l - B a c k e n d  
 