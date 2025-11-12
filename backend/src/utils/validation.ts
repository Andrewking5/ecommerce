import Joi from 'joi';
import { Request } from 'express';
import { t } from './i18n';

/**
 * 根据请求获取验证消息
 */
const getValidationMessages = (req: Request) => ({
  email: {
    'string.email': t(req, 'validation.email.invalid', 'Please enter a valid email address'),
    'any.required': t(req, 'validation.email.required', 'Email is required'),
  },
  password: {
    'string.min': t(req, 'validation.password.minLength', 'Password must be at least 8 characters'),
    'string.pattern.base': t(req, 'validation.password.pattern', 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    'any.required': t(req, 'validation.password.required', 'Password is required'),
  },
  firstName: {
    'string.min': t(req, 'validation.firstName.minLength', 'First name must be at least 2 characters'),
    'string.max': t(req, 'validation.firstName.maxLength', 'First name must not exceed 50 characters'),
    'any.required': t(req, 'validation.firstName.required', 'First name is required'),
  },
  lastName: {
    'string.min': t(req, 'validation.lastName.minLength', 'Last name must be at least 2 characters'),
    'string.max': t(req, 'validation.lastName.maxLength', 'Last name must not exceed 50 characters'),
    'any.required': t(req, 'validation.lastName.required', 'Last name is required'),
  },
  phone: {
    'string.pattern.base': t(req, 'validation.phone.invalid', 'Phone number format is invalid'),
  },
});

/**
 * 创建验证 schema（支持多语言）
 */
export const createSchemas = (req: Request) => {
  const messages = getValidationMessages(req);
  
  return {
    // 用戶註冊
    register: Joi.object({
      email: Joi.string().email().required()
        .messages(messages.email),
      password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
        .messages(messages.password),
      firstName: Joi.string().min(2).max(50).required()
        .messages(messages.firstName),
      lastName: Joi.string().min(2).max(50).required()
        .messages(messages.lastName),
      phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('', null).optional()
        .messages(messages.phone),
    }),

    // 用戶登入
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  };
};

// 向后兼容：默认使用英文消息
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
  }),
};

// 導出常用的 schema
export const registerSchema = schemas.register;
export const loginSchema = schemas.login;
export const productSchema = schemas.product;
export const orderSchema = schemas.order;


