import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ayers Guitars API',
      version: '1.0.0',
      description: 'E-commerce API for Ayers Guitars — premium handcrafted acoustic guitars since 1996',
      contact: {
        name: 'Ayers Guitars',
        url: 'https://ayersguitars.com',
      },
    },
    servers: [
      { url: '/api', description: 'API Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            images: { type: 'array', items: { type: 'string' } },
            stock: { type: 'integer' },
            categoryId: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] },
            totalAmount: { type: 'number' },
            shippingAddress: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Products', description: 'Product catalog' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Users', description: 'User profiles' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Payments', description: 'Stripe payments' },
      { name: 'Wishlist', description: 'User wishlist' },
      { name: 'Newsletter', description: 'Newsletter subscriptions' },
      { name: 'Admin', description: 'Admin operations' },
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email', 'password', 'firstName', 'lastName'], properties: { email: { type: 'string' }, password: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' }, phone: { type: 'string' } } } } },
          },
          responses: { '201': { description: 'User registered' }, '400': { description: 'Validation error' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } },
          },
          responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials' } },
        },
      },
      '/auth/refresh': { post: { tags: ['Auth'], summary: 'Refresh access token (refresh token in HttpOnly cookie)', responses: { '200': { description: 'Token refreshed' } } } },
      '/auth/logout': { post: { tags: ['Auth'], summary: 'Logout (clears refresh cookie)', responses: { '200': { description: 'Logged out' } } } },
      '/auth/forgot-password': { post: { tags: ['Auth'], summary: 'Request password reset email', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } } }, responses: { '200': { description: 'Reset email sent' } } } },
      '/auth/reset-password': { post: { tags: ['Auth'], summary: 'Reset password with token', responses: { '200': { description: 'Password reset' } } } },
      '/auth/verify-email': { post: { tags: ['Auth'], summary: 'Verify email address', responses: { '200': { description: 'Email verified' } } } },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List products with filtering, sorting, pagination',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'name', 'price', 'stock'] } },
          ],
          responses: { '200': { description: 'Product list with pagination' } },
        },
      },
      '/products/search': { get: { tags: ['Products'], summary: 'Full-text search products', parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Search results' } } } },
      '/products/{id}': { get: { tags: ['Products'], summary: 'Get product by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Product details' } } } },
      '/products/{id}/recommendations': { get: { tags: ['Products'], summary: 'Get product recommendations', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Recommended products' } } } },
      '/orders': {
        get: { tags: ['Orders'], summary: 'Get user orders', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Order list' } } },
        post: { tags: ['Orders'], summary: 'Create order', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Order created' } } },
      },
      '/orders/{id}/invoice': { get: { tags: ['Orders'], summary: 'Download invoice PDF', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'PDF file', content: { 'application/pdf': {} } } } } },
      '/wishlist': { get: { tags: ['Wishlist'], summary: 'Get user wishlist', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Wishlist items' } } } },
      '/wishlist/toggle': { post: { tags: ['Wishlist'], summary: 'Toggle wishlist item', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Toggled' } } } },
      '/reviews/product/{productId}': { get: { tags: ['Reviews'], summary: 'Get product reviews', parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Review list' } } } },
      '/newsletter/subscribe': { post: { tags: ['Newsletter'], summary: 'Subscribe to newsletter (double opt-in)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } } }, responses: { '200': { description: 'Subscribed' } } } },
      '/health': { get: { tags: ['Admin'], summary: 'Health check', responses: { '200': { description: 'Server health status' } } } },
    },
  },
  apis: [], // We defined paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);
