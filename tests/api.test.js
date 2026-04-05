const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

let adminToken, analystToken, viewerToken;
let adminId, analystId, viewerId;

// ─── Setup & Teardown ──────────────────────────────────────────────

beforeAll(async () => {
  // Clean database
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Test Admin', email: 'testadmin@test.com', password: hashedPassword, role: 'ADMIN' },
  });
  const analyst = await prisma.user.create({
    data: { name: 'Test Analyst', email: 'testanalyst@test.com', password: hashedPassword, role: 'ANALYST' },
  });
  const viewer = await prisma.user.create({
    data: { name: 'Test Viewer', email: 'testviewer@test.com', password: hashedPassword, role: 'VIEWER' },
  });

  adminId = admin.id;
  analystId = analyst.id;
  viewerId = viewer.id;

  // Login to get tokens
  const loginAdmin = await request(app).post('/api/auth/login').send({ email: 'testadmin@test.com', password: 'password123' });
  adminToken = loginAdmin.body.data.token;

  const loginAnalyst = await request(app).post('/api/auth/login').send({ email: 'testanalyst@test.com', password: 'password123' });
  analystToken = loginAnalyst.body.data.token;

  const loginViewer = await request(app).post('/api/auth/login').send({ email: 'testviewer@test.com', password: 'password123' });
  viewerToken = loginViewer.body.data.token;
});

afterAll(async () => {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// ─── Auth Tests ──────────────────────────────────────────────────

describe('Auth API', () => {
  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New User',
      email: 'newuser@test.com',
      password: 'password123',
      role: 'VIEWER',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('newuser@test.com');
  });

  test('POST /api/auth/register - should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate',
      email: 'testadmin@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register - should validate input', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'not-an-email',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/login - should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testadmin@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  test('POST /api/auth/login - should reject invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testadmin@test.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - should return current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('testadmin@test.com');
    expect(res.body.data.role).toBe('ADMIN');
  });

  test('GET /api/auth/me - should reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ─── User Management Tests ──────────────────────────────────────

describe('Users API', () => {
  test('GET /api/users - admin can list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
  });

  test('GET /api/users - viewer cannot list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  test('GET /api/users - analyst cannot list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(403);
  });

  test('GET /api/users/:id - admin can get user by ID', async () => {
    const res = await request(app)
      .get(`/api/users/${analystId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('testanalyst@test.com');
  });

  test('PATCH /api/users/:id - admin can update user role', async () => {
    const res = await request(app)
      .patch(`/api/users/${viewerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ANALYST' });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('ANALYST');

    // Reset role
    await request(app)
      .patch(`/api/users/${viewerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'VIEWER' });
  });
});

// ─── Financial Records Tests ─────────────────────────────────────

describe('Records API', () => {
  let createdRecordId;

  test('POST /api/records - admin can create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 5000.00,
        type: 'INCOME',
        category: 'Salary',
        date: '2024-06-15',
        description: 'Monthly salary',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(5000);
    createdRecordId = res.body.data.id;
  });

  test('POST /api/records - viewer cannot create records', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        amount: 100,
        type: 'EXPENSE',
        category: 'Food',
        date: '2024-06-15',
      });

    expect(res.status).toBe(403);
  });

  test('POST /api/records - analyst cannot create records', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({
        amount: 100,
        type: 'EXPENSE',
        category: 'Food',
        date: '2024-06-15',
      });

    expect(res.status).toBe(403);
  });

  test('POST /api/records - should validate input', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: -100,
        type: 'INVALID',
        category: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('GET /api/records - analyst can list records', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/records - viewer cannot list records', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  test('GET /api/records - supports filtering by type', async () => {
    const res = await request(app)
      .get('/api/records?type=INCOME')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    res.body.data.forEach((record) => {
      expect(record.type).toBe('INCOME');
    });
  });

  test('GET /api/records/:id - admin can get record by ID', async () => {
    const res = await request(app)
      .get(`/api/records/${createdRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdRecordId);
  });

  test('PATCH /api/records/:id - admin can update a record', async () => {
    const res = await request(app)
      .patch(`/api/records/${createdRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 6000, description: 'Updated salary' });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(6000);
  });

  test('DELETE /api/records/:id - admin can soft-delete a record', async () => {
    const res = await request(app)
      .delete(`/api/records/${createdRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isDeleted).toBe(true);
  });

  test('GET /api/records/:id - deleted record is not found', async () => {
    const res = await request(app)
      .get(`/api/records/${createdRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

// ─── Dashboard Tests ──────────────────────────────────────────────

describe('Dashboard API', () => {
  // Create some records for dashboard tests
  beforeAll(async () => {
    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 10000, type: 'INCOME', category: 'Salary', date: '2024-06-01' });
    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2000, type: 'EXPENSE', category: 'Rent', date: '2024-06-01' });
    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 500, type: 'EXPENSE', category: 'Food', date: '2024-06-15' });
  });

  test('GET /api/dashboard/summary - viewer can access summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalIncome');
    expect(res.body.data).toHaveProperty('totalExpenses');
    expect(res.body.data).toHaveProperty('netBalance');
    expect(res.body.data).toHaveProperty('totalRecords');
  });

  test('GET /api/dashboard/category-summary - analyst can access', async () => {
    const res = await request(app)
      .get('/api/dashboard/category-summary')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/dashboard/category-summary - viewer cannot access', async () => {
    const res = await request(app)
      .get('/api/dashboard/category-summary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  test('GET /api/dashboard/trends - analyst can access', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/dashboard/trends - viewer cannot access', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  test('GET /api/dashboard/recent-activity - viewer can access', async () => {
    const res = await request(app)
      .get('/api/dashboard/recent-activity')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/dashboard/recent-activity - unauthenticated cannot access', async () => {
    const res = await request(app).get('/api/dashboard/recent-activity');
    expect(res.status).toBe(401);
  });
});

// ─── Health Check ────────────────────────────────────────────────

describe('Health Check', () => {
  test('GET /api/health - should return healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────

describe('404 Handler', () => {
  test('GET /nonexistent - should return 404', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
