/**
 * Order API Tests
 *
 * Covers: GET /api/orders, POST /api/orders, GET /api/orders/:id,
 *         PUT /api/orders/:id/status, unauthenticated access
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
const userToken = () =>
  generateAccessToken(testUser.id, testUser.email, testUser.role);
const adminToken = () =>
  generateAccessToken(testAdmin.id, testAdmin.email, testAdmin.role);

function mockAuthUser(user: any) {
  mockPrisma.user.findUnique.mockResolvedValue({ ...user, isActive: true });
}

const sampleOrder = {
  id: 'order-1',
  userId: testUser.id,
  status: 'PENDING',
  totalAmount: 109.99,
  shippingCost: 10,
  taxAmount: 8,
  discountAmount: null,
  couponCode: null,
  shippingAddress: {
    street: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'US',
  },
  billingAddress: null,
  paymentMethod: 'stripe',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  orderItems: [
    {
      id: 'oi-1',
      productId: 'prod-1',
      quantity: 1,
      price: 99.99,
      product: {
        id: 'prod-1',
        name: 'Acoustic Guitar',
        images: ['https://example.com/guitar.jpg'],
      },
    },
  ],
  user: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
  },
};

const sampleProduct = {
  id: 'prod-1',
  name: 'Acoustic Guitar',
  price: 99.99,
  stock: 10,
  isActive: true,
};

// ---------------------------------------------------------------------------
// Unauthenticated access
// ---------------------------------------------------------------------------
describe('Orders — unauthenticated access', () => {
  it('GET /api/orders/ should return 401', async () => {
    const res = await request(app).get('/api/orders/');
    expect(res.status).toBe(401);
  });

  it('POST /api/orders/ should return 401', async () => {
    const res = await request(app).post('/api/orders/').send({});
    expect(res.status).toBe(401);
  });

  it('GET /api/orders/:id should return 401', async () => {
    const res = await request(app).get('/api/orders/order-1');
    expect(res.status).toBe(401);
  });

  it('PUT /api/orders/:id/status should return 401', async () => {
    const res = await request(app)
      .put('/api/orders/order-1/status')
      .send({ status: 'SHIPPED' });
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/orders/ — authenticated user gets their orders
// ---------------------------------------------------------------------------
describe('GET /api/orders/', () => {
  it('should return the current user orders', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findMany.mockResolvedValue([sampleOrder]);
    mockPrisma.order.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/orders/')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orders).toHaveLength(1);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should return empty list when user has no orders', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.order.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/orders/')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.orders).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// POST /api/orders/ — create order with items
// ---------------------------------------------------------------------------
describe('POST /api/orders/', () => {
  const validOrder = {
    items: [{ productId: 'prod-1', quantity: 1 }],
    shippingAddress: {
      street: '123 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
    },
    paymentMethod: 'stripe',
  };

  it('should create an order successfully', async () => {
    mockAuthUser(testUser);
    mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);
    mockPrisma.order.create.mockResolvedValue(sampleOrder);
    mockPrisma.product.update.mockResolvedValue(sampleProduct);

    const res = await request(app)
      .post('/api/orders/')
      .set('Authorization', `Bearer ${userToken()}`)
      .send(validOrder);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe('order-1');
  });

  it('should return 400 when product is not found', async () => {
    mockAuthUser(testUser);
    mockPrisma.product.findMany.mockResolvedValue([]); // product not found

    const res = await request(app)
      .post('/api/orders/')
      .set('Authorization', `Bearer ${userToken()}`)
      .send(validOrder);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when insufficient stock', async () => {
    mockAuthUser(testUser);
    mockPrisma.product.findMany.mockResolvedValue([
      { ...sampleProduct, stock: 0 },
    ]);

    const res = await request(app)
      .post('/api/orders/')
      .set('Authorization', `Bearer ${userToken()}`)
      .send(validOrder);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Insufficient stock');
  });
});

// ---------------------------------------------------------------------------
// GET /api/orders/:id — get order details
// ---------------------------------------------------------------------------
describe('GET /api/orders/:id', () => {
  it('should return order details for the owning user', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findFirst.mockResolvedValue(sampleOrder);

    const res = await request(app)
      .get('/api/orders/order-1')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('order-1');
  });

  it('should return 404 when order does not exist', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/orders/non-existent')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/orders/:id/status — admin updates order status
// ---------------------------------------------------------------------------
describe('PUT /api/orders/:id/status', () => {
  it('should update order status when authenticated as admin', async () => {
    mockAuthUser(testAdmin);
    mockPrisma.order.update.mockResolvedValue({
      ...sampleOrder,
      status: 'SHIPPED',
      user: testAdmin,
    });

    const res = await request(app)
      .put('/api/orders/order-1/status')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SHIPPED');
  });

  it('should return 403 when authenticated as regular user', async () => {
    mockAuthUser(testUser);

    const res = await request(app)
      .put('/api/orders/order-1/status')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(403);
  });

  it('should include tracking info when shipping', async () => {
    mockAuthUser(testAdmin);
    const shippedOrder = {
      ...sampleOrder,
      status: 'SHIPPED',
      trackingNumber: 'TRACK123',
      carrier: 'FedEx',
      user: testAdmin,
    };
    mockPrisma.order.update.mockResolvedValue(shippedOrder);

    const res = await request(app)
      .put('/api/orders/order-1/status')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({
        status: 'SHIPPED',
        trackingNumber: 'TRACK123',
        carrier: 'FedEx',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
