/**
 * Product API Tests
 *
 * Covers: GET /api/products, GET /api/products/:id, GET /api/products/search,
 *         POST /api/products, PUT /api/products/:id, DELETE /api/products/:id
 */

import './setup';
import request from 'supertest';
import app from '../src/app';
import {
  mockPrisma,
  testUser,
  testAdmin,
  generateAccessToken,
} from './setup';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const adminToken = () =>
  generateAccessToken(testAdmin.id, testAdmin.email, testAdmin.role);
const userToken = () =>
  generateAccessToken(testUser.id, testUser.email, testUser.role);

const sampleProduct = {
  id: 'prod-1',
  name: 'Acoustic Guitar',
  description: 'A beautiful acoustic guitar',
  price: 999.99,
  stock: 10,
  images: ['https://example.com/guitar.jpg'],
  isActive: true,
  hasVariants: false,
  categoryId: 'cat-1',
  specifications: {},
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  category: { id: 'cat-1', name: 'Guitars', slug: 'guitars', isActive: true },
  reviews: [],
  variants: [],
};

// Helper to mock the auth middleware's user lookup
function mockAuthUser(user: any) {
  mockPrisma.user.findUnique.mockResolvedValue({
    ...user,
    isActive: true,
  });
}

// ---------------------------------------------------------------------------
// GET /api/products/
// ---------------------------------------------------------------------------
describe('GET /api/products/', () => {
  it('should return a paginated product list', async () => {
    mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);
    mockPrisma.product.count.mockResolvedValue(1);

    const res = await request(app).get('/api/products/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('should return empty list when no products exist', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);

    const res = await request(app).get('/api/products/');

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GET /api/products/:id
// ---------------------------------------------------------------------------
describe('GET /api/products/:id', () => {
  it('should return a single product', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(sampleProduct);

    const res = await request(app).get('/api/products/prod-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('prod-1');
  });

  it('should return 404 for non-existent product', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/products/non-existent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GET /api/products/search?q=guitar
// ---------------------------------------------------------------------------
describe('GET /api/products/search', () => {
  it('should return search results', async () => {
    mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);

    const res = await request(app).get('/api/products/search?q=guitar');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 400 when query parameter is missing', async () => {
    const res = await request(app).get('/api/products/search');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return empty array when nothing matches', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/products/search?q=nonexistent');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// POST /api/products/ — admin only
// ---------------------------------------------------------------------------
describe('POST /api/products/', () => {
  const newProduct = {
    name: 'Electric Guitar',
    description: 'A powerful electric guitar',
    price: 1299.99,
    categoryId: 'cat-1',
    images: ['https://example.com/electric.jpg'],
    stock: 5,
  };

  it('should create a product when authenticated as admin', async () => {
    mockAuthUser(testAdmin);
    mockPrisma.product.create.mockResolvedValue({
      ...sampleProduct,
      ...newProduct,
      id: 'prod-new',
    });

    const res = await request(app)
      .post('/api/products/')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send(newProduct);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/products/')
      .send(newProduct);

    expect(res.status).toBe(401);
  });

  it('should return 403 when authenticated as regular user', async () => {
    mockAuthUser(testUser);

    const res = await request(app)
      .post('/api/products/')
      .set('Authorization', `Bearer ${userToken()}`)
      .send(newProduct);

    expect(res.status).toBe(403);
  });

  it('should return 400 when required fields are missing', async () => {
    mockAuthUser(testAdmin);

    const res = await request(app)
      .post('/api/products/')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'Incomplete' }); // missing description, price

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/products/:id — admin only
// ---------------------------------------------------------------------------
describe('PUT /api/products/:id', () => {
  it('should update a product when authenticated as admin', async () => {
    mockAuthUser(testAdmin);
    mockPrisma.product.findUnique.mockResolvedValue(sampleProduct);
    mockPrisma.product.update.mockResolvedValue({
      ...sampleProduct,
      name: 'Updated Guitar',
    });

    const res = await request(app)
      .put('/api/products/prod-1')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'Updated Guitar' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Guitar');
  });

  it('should return 404 when product does not exist', async () => {
    mockAuthUser(testAdmin);
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/products/non-existent')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 403 when authenticated as regular user', async () => {
    mockAuthUser(testUser);

    const res = await request(app)
      .put('/api/products/prod-1')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ name: 'Nope' });

    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/products/:id — admin only, soft delete
// ---------------------------------------------------------------------------
describe('DELETE /api/products/:id', () => {
  it('should soft-delete a product when authenticated as admin', async () => {
    mockAuthUser(testAdmin);
    mockPrisma.product.findUnique.mockResolvedValue(sampleProduct);
    mockPrisma.product.update.mockResolvedValue({
      ...sampleProduct,
      isActive: false,
    });

    const res = await request(app)
      .delete('/api/products/prod-1')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Verify soft-delete was called with isActive: false
    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1' },
        data: { isActive: false },
      }),
    );
  });

  it('should return 404 when product does not exist', async () => {
    mockAuthUser(testAdmin);
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/products/non-existent')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 403 when authenticated as regular user', async () => {
    mockAuthUser(testUser);

    const res = await request(app)
      .delete('/api/products/prod-1')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(403);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).delete('/api/products/prod-1');

    expect(res.status).toBe(401);
  });
});
