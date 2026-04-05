# Finance Data Processing & Access Control Backend

Build a production-quality backend for a finance dashboard system with role-based access control, financial records management, and analytics APIs.

## Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Runtime** | Node.js 18+ | Widely understood, excellent ecosystem |
| **Framework** | Express.js | Lightweight, flexible, battle-tested |
| **ORM** | Prisma | Type-safe queries, clean schema, auto migrations |
| **Database** | SQLite | Zero-config, portable, perfect for assessment |
| **Auth** | JWT (jsonwebtoken + bcryptjs) | Stateless, industry-standard token auth |
| **Validation** | Zod | TypeScript-first schema validation |
| **Docs** | Swagger (swagger-jsdoc + swagger-ui-express) | Interactive API documentation |
| **Testing** | Jest + Supertest | Unit & integration testing |
| **Rate Limiting** | express-rate-limit | Protection against abuse |

## User Review Required

> [!IMPORTANT]
> **Tech Stack Confirmation**: The plan uses **Node.js + Express + SQLite + Prisma**. If you prefer a different language/framework (Python/Django, Go, etc.), let me know before I proceed.

> [!NOTE]
> **Scope**: I'll implement all 6 core requirements + most optional enhancements (JWT auth, pagination, soft delete, rate limiting, tests, Swagger docs). This will be a comprehensive but clean submission.

---

## Project Structure

```
e:\surya\
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── index.js           # App configuration (env vars, constants)
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   ├── authorize.js       # Role-based access control middleware
│   │   ├── validate.js        # Zod validation middleware
│   │   ├── errorHandler.js    # Global error handler
│   │   └── rateLimiter.js     # Rate limiting middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   ├── records/
│   │   │   ├── record.controller.js
│   │   │   ├── record.service.js
│   │   │   ├── record.routes.js
│   │   │   └── record.validation.js
│   │   └── dashboard/
│   │       ├── dashboard.controller.js
│   │       ├── dashboard.service.js
│   │       └── dashboard.routes.js
│   ├── utils/
│   │   ├── ApiError.js        # Custom error class
│   │   ├── ApiResponse.js     # Standardized response wrapper
│   │   └── prisma.js          # Prisma client singleton
│   ├── app.js                 # Express app setup
│   └── server.js              # Entry point
├── tests/
│   ├── auth.test.js
│   ├── users.test.js
│   ├── records.test.js
│   └── dashboard.test.js
├── seed.js                    # Database seeder with sample data
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md                  # Comprehensive documentation
```

---

## Database Schema

### Users Table
| Column | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| name | String | Full name |
| email | String | Unique, for login |
| password | String | Bcrypt hashed |
| role | Enum (VIEWER, ANALYST, ADMIN) | Access level |
| isActive | Boolean | Soft active/inactive status |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Financial Records Table
| Column | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| amount | Float | Transaction amount |
| type | Enum (INCOME, EXPENSE) | Transaction type |
| category | String | e.g., Salary, Rent, Food |
| date | DateTime | Transaction date |
| description | String? | Optional notes |
| createdById | String (FK) | Who created this record |
| isDeleted | Boolean | Soft delete flag |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Authenticated | Get current user profile |

### Users (`/api/users`)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users (paginated) |
| GET | `/:id` | Admin | Get user by ID |
| PATCH | `/:id` | Admin | Update user (role, status) |
| DELETE | `/:id` | Admin | Deactivate user |

### Financial Records (`/api/records`)
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Admin | Create a financial record |
| GET | `/` | Analyst, Admin | List records (filtered, paginated) |
| GET | `/:id` | Analyst, Admin | Get single record |
| PATCH | `/:id` | Admin | Update record |
| DELETE | `/:id` | Admin | Soft-delete record |

**Filters**: `?type=INCOME&category=Salary&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20&sortBy=date&order=desc`

### Dashboard (`/api/dashboard`)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/summary` | Viewer, Analyst, Admin | Total income, expenses, net balance |
| GET | `/category-summary` | Analyst, Admin | Category-wise breakdown |
| GET | `/trends` | Analyst, Admin | Monthly income/expense trends |
| GET | `/recent-activity` | Viewer, Analyst, Admin | Last 10 records |

### Access Control Matrix

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| View dashboard summary | ✅ | ✅ | ✅ |
| View category breakdown | ❌ | ✅ | ✅ |
| View trends | ❌ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| List/view records | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Proposed Changes

### 1. Project Setup
#### [NEW] package.json, .env, .gitignore, prisma/schema.prisma
- Initialize npm project with all dependencies
- Define Prisma schema with User and FinancialRecord models
- Configure environment variables

---

### 2. Core Infrastructure (`src/config`, `src/utils`, `src/middleware`)
#### [NEW] Config, utilities, and middleware files
- `ApiError` class for structured error throwing
- `ApiResponse` class for consistent JSON responses
- JWT auth middleware (extract & verify token)
- `authorize(...roles)` middleware factory for RBAC
- Zod validation middleware wrapper
- Global error handler with proper HTTP status codes
- Rate limiter configuration

---

### 3. Auth Module (`src/modules/auth/`)
#### [NEW] auth.controller.js, auth.service.js, auth.routes.js, auth.validation.js
- Register: hash password, create user, return JWT
- Login: verify credentials, return JWT
- Me: return current user from token
- Zod schemas for register/login input validation

---

### 4. Users Module (`src/modules/users/`)
#### [NEW] user.controller.js, user.service.js, user.routes.js, user.validation.js
- Admin-only CRUD for user management
- Update roles, toggle active status
- Paginated listing

---

### 5. Records Module (`src/modules/records/`)
#### [NEW] record.controller.js, record.service.js, record.routes.js, record.validation.js
- Full CRUD with soft delete
- Advanced filtering (type, category, date range)
- Pagination and sorting
- Input validation for amounts, dates, categories

---

### 6. Dashboard Module (`src/modules/dashboard/`)
#### [NEW] dashboard.controller.js, dashboard.service.js, dashboard.routes.js
- Aggregation queries for income/expense totals
- Category-wise breakdown with Prisma groupBy
- Monthly trends using date-based grouping
- Recent activity feed

---

### 7. Seeder & Tests
#### [NEW] seed.js, tests/*.test.js
- Seeder creates: 1 admin, 1 analyst, 1 viewer + 50 sample financial records
- Jest + Supertest integration tests for all endpoints

---

### 8. Documentation
#### [NEW] README.md
- Project overview, setup instructions, API reference
- Assumptions and design decisions documented
- Architecture diagram

---

## Verification Plan

### Automated Tests
- Run `npm test` — Jest + Supertest integration tests covering:
  - Auth flow (register, login, token validation)
  - RBAC enforcement (viewer can't create records, analyst can't manage users)
  - CRUD operations on records
  - Dashboard aggregation correctness
  - Validation error responses
  - Edge cases (duplicate email, invalid JWT, inactive user)

### Manual Verification
- Run `npm run dev` and test with Swagger UI at `http://localhost:3000/api-docs`
- Seed the database with `npm run seed` and verify data
- Test each endpoint via Swagger with different role tokens
