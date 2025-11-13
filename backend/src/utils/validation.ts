import Joi from 'joi';

export const schemas = {
  // 用戶註冊
  register: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required',
      }),
    firstName: Joi.string().min(2).max(50).required()
      .messages({
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name must not exceed 50 characters',
        'any.required': 'First name is required',
      }),
    lastName: Joi.string().min(2).max(50).required()
      .messages({
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name must not exceed 50 characters',
        'any.required': 'Last name is required',
      }),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('', null).optional()
      .messages({
        'string.pattern.base': 'Phone number format is invalid',
      }),
  }),

  // 用戶登入
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // 商品創建
  product: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().required(),
    images: Joi.array().items(Joi.string().uri()).min(1).required(),
    stock: Joi.number().integer().min(0).required(),
    specifications: Joi.object().optional(),
  }),

  // 訂單創建
  order: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    billingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).optional(),
    paymentMethod: Joi.string().valid('stripe', 'paypal').required(),
    couponCode: Joi.string().optional(),
    shippingCost: Joi.number().min(0).optional(),
    addressId: Joi.string().optional(), // 地址ID，如果提供则使用保存的地址
  }),

  // 地址创建/更新
  address: Joi.object({
    recipientName: Joi.string().min(2).max(50).required()
      .messages({
        'string.min': 'Recipient name must be at least 2 characters',
        'string.max': 'Recipient name must not exceed 50 characters',
        'any.required': 'Recipient name is required',
      }),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).required()
      .messages({
        'string.pattern.base': 'Phone number format is invalid',
        'any.required': 'Phone number is required',
      }),
    province: Joi.string().min(1).required()
      .messages({
        'any.required': 'Province is required',
      }),
    city: Joi.string().min(1).required()
      .messages({
        'any.required': 'City is required',
      }),
    district: Joi.string().min(1).required()
      .messages({
        'any.required': 'District is required',
      }),
    street: Joi.string().min(5).max(200).required()
      .messages({
        'string.min': 'Street address must be at least 5 characters',
        'string.max': 'Street address must not exceed 200 characters',
        'any.required': 'Street address is required',
      }),
    zipCode: Joi.string().pattern(/^[0-9]{5,10}$/).allow('', null).optional()
      .messages({
        'string.pattern.base': 'Zip code must be 5-10 digits',
      }),
    label: Joi.string().max(20).allow('', null).optional()
      .messages({
        'string.max': 'Label must not exceed 20 characters',
      }),
    isDefault: Joi.boolean().optional(),
  }),
};

// 導出常用的 schema
export const registerSchema = schemas.register;
export const loginSchema = schemas.login;
export const productSchema = schemas.product;
export const orderSchema = schemas.order;
export const addressSchema = schemas.address;


