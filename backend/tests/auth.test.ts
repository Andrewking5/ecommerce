/**
 * Auth API Tests
 *
 * Covers: POST /api/auth/register, /login, /refresh, /logout
 */

import './setup';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app';
import {
  mockPrisma,
  testUser,
  generateAccessToken,
  generateRefreshToken,
  generateExpiredRefreshToken,
} from './setup';

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
describe('POST /api/auth/register', () => {
  const validBody = {
    email: 'new@example.com',
    password: 'Password1',
    firstName: 'New',
    lastName: 'User',
  };

  it('should register a new user and return 201 with tokens', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      ...testUser,
      id: 'new-user-id',
      email: validBody.email,
      firstName: validBody.firstName,
      lastName: validBody.lastName,
      password: 'hashed',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user).toBeDefined();
    // password must not be leaked
    expect(res.body.user.password).toBeUndefined();
  });

  it('should return 400 when email already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(validBody);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com' }); // missing password, firstName, lastName

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when password is too weak', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validBody, password: '123' }); // too short, no upper/lower/digit

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
describe('POST /api/auth/login', () => {
  const loginBody = { email: 'test@example.com', password: 'Password1' };

  it('should login successfully with valid credentials', async () => {
    const hashed = await bcrypt.hash(loginBody.password, 12);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...testUser,
      password: hashed,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginBody);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('should return 401 with wrong password', async () => {
    const hashed = await bcrypt.hash('DifferentPassword1', 12);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...testUser,
      password: hashed,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginBody);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginBody);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password1' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for social-login user without password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...testUser,
      password: null, // social login user
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginBody);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------
describe('POST /api/auth/refresh', () => {
  it('should return new tokens with a valid refresh token', async () => {
    const refreshToken = generateRefreshToken(testUser.id);
    mockPrisma.user.findUnique.mockResolvedValue({ ...testUser, isActive: true });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('should return 401 with an expired refresh token', async () => {
    const expired = generateExpiredRefreshToken(testUser.id);

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: expired });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 with an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'completely.invalid.token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when no refresh token is provided', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when user is inactive', async () => {
    const refreshToken = generateRefreshToken(testUser.id);
    mockPrisma.user.findUnique.mockResolvedValue({ ...testUser, isActive: false });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
describe('POST /api/auth/logout', () => {
  it('should return success', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
