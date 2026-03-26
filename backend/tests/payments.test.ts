/**
 * Payment API Tests
 *
 * Covers: POST /api/payments/create-intent, GET /api/payments/:orderId,
 *         POST /api/payments/webhook
 */

import './setup';
import request from 'supertest';
import app from '../src/app';
import {
  mockPrisma,
  testUser,
  generateAccessToken,
} from './setup';
import { PaymentService } from '../src/services/paymentService';

// PaymentService is mocked in setup.ts — grab the mock reference
const mockedPaymentService = PaymentService as jest.Mocked<typeof PaymentService>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const userToken = () =>
  generateAccessToken(testUser.id, testUser.email, testUser.role);

function mockAuthUser(user: any) {
  mockPrisma.user.findUnique.mockResolvedValue({ ...user, isActive: true });
}

const sampleOrder = {
  id: 'order-1',
  userId: testUser.id,
  status: 'PENDING',
  totalAmount: 109.99,
  createdAt: new Date(),
};

// ---------------------------------------------------------------------------
// POST /api/payments/create-intent
// ---------------------------------------------------------------------------
describe('POST /api/payments/create-intent', () => {
  const body = { orderId: 'order-1', amount: 109.99, currency: 'twd' };

  it('should create a payment intent for a valid order', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findFirst.mockResolvedValue(sampleOrder);
    mockedPaymentService.createPaymentIntent.mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'secret_test_123',
    } as any);

    const res = await request(app)
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${userToken()}`)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.clientSecret).toBe('secret_test_123');
    expect(res.body.data.paymentIntentId).toBe('pi_test_123');
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/payments/create-intent')
      .send(body);

    expect(res.status).toBe(401);
  });

  it('should return 400 when orderId or amount is missing', async () => {
    mockAuthUser(testUser);

    const res = await request(app)
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ orderId: 'order-1' }); // missing amount

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 when order does not belong to user', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${userToken()}`)
      .send(body);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 when PaymentService throws', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findFirst.mockResolvedValue(sampleOrder);
    mockedPaymentService.createPaymentIntent.mockRejectedValue(
      new Error('Stripe error'),
    );

    const res = await request(app)
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${userToken()}`)
      .send(body);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GET /api/payments/:orderId — get payment status
// ---------------------------------------------------------------------------
describe('GET /api/payments/:orderId', () => {
  it('should return payment status for a valid order', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findFirst.mockResolvedValue(sampleOrder);
    mockedPaymentService.getPaymentStatus.mockResolvedValue({
      id: 'pay-1',
      orderId: 'order-1',
      status: 'SUCCEEDED',
      amount: 109.99,
    } as any);

    const res = await request(app)
      .get('/api/payments/order-1')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUCCEEDED');
  });

  it('should return 404 when order does not belong to user', async () => {
    mockAuthUser(testUser);
    mockPrisma.order.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/payments/order-999')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/payments/order-1');

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/payments/webhook — Stripe webhook
// ---------------------------------------------------------------------------
describe('POST /api/payments/webhook', () => {
  it('should process a valid webhook event', async () => {
    const fakeEvent = { id: 'evt_1', type: 'payment_intent.succeeded', data: {} };
    mockedPaymentService.verifyWebhookSignature.mockReturnValue(fakeEvent as any);
    mockedPaymentService.handleWebhook.mockResolvedValue({
      success: true,
      message: 'ok',
    });

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', 'sig_test_123')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_1' }));

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it('should return 400 when stripe-signature header is missing', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_1' }));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when signature verification fails', async () => {
    mockedPaymentService.verifyWebhookSignature.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', 'bad_sig')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_1' }));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when webhook processing fails', async () => {
    const fakeEvent = { id: 'evt_2', type: 'payment_intent.payment_failed', data: {} };
    mockedPaymentService.verifyWebhookSignature.mockReturnValue(fakeEvent as any);
    mockedPaymentService.handleWebhook.mockRejectedValue(
      new Error('Processing failed'),
    );

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', 'sig_test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_2' }));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
