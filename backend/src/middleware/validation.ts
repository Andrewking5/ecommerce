import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 在开发环境中记录请求体
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Validation request body:', JSON.stringify(req.body, null, 2));
    }
    
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // 返回所有验证错误
      stripUnknown: true, // 移除未知字段
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      
      // 在开发环境中记录验证错误
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Validation errors:', errorMessages);
        console.error('❌ Validation error details:', error.details);
      }
      
      res.status(400).json({
        success: false,
        message: errorMessages.length === 1 ? errorMessages[0] : 'Validation error',
        details: errorMessages,
      });
      return;
    }
    
    // 在开发环境中记录验证通过
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Validation passed, validated data:', JSON.stringify(value, null, 2));
    }
    
    // 将验证后的数据替换原始请求体
    req.body = value;
    
    next();
    return;
  };
};

