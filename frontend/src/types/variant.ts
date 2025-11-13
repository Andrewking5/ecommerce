// 商品变体系统类型定义

export enum AttributeType {
  TEXT = 'TEXT',
  COLOR = 'COLOR',
  IMAGE = 'IMAGE',
  SELECT = 'SELECT',
  NUMBER = 'NUMBER',
}

// 商品属性
export interface ProductAttribute {
  id: string;
  name: string;
  displayName?: string | null;
  type: AttributeType;
  categoryId?: string | null;
  values: any; // JSON 类型
  isRequired: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

// 变体属性关联
export interface ProductVariantAttribute {
  id: string;
  variantId: string;
  attributeId: string;
  value: string;
  displayValue?: string | null;
  attribute?: ProductAttribute;
}

// 商品变体
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  reservedStock: number;
  weight?: number | null;
  dimensions?: any | null; // JSON 类型
  barcode?: string | null;
  images: string[];
  isDefault: boolean;
  isActive: boolean;
  displayOrder?: number; // 显示顺序
  createdAt: string;
  updatedAt: string;
  attributes?: ProductVariantAttribute[];
  product?: {
    id: string;
    name: string;
  };
}

// 属性模板
export interface ProductAttributeTemplate {
  id: string;
  name: string;
  categoryId?: string | null;
  attributes: any; // JSON 类型
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

// 变体选择（用于用户选择）
export interface VariantSelection {
  [attributeId: string]: string; // attributeId -> value
}

// API 请求类型
export interface CreateAttributeRequest {
  name: string;
  displayName?: string;
  type: AttributeType;
  categoryId?: string;
  values: any;
  isRequired?: boolean;
  displayOrder?: number;
}

export interface UpdateAttributeRequest {
  name?: string;
  displayName?: string;
  type?: AttributeType;
  categoryId?: string;
  values?: any;
  isRequired?: boolean;
  displayOrder?: number;
}

export interface CreateVariantRequest {
  productId: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  reservedStock?: number;
  weight?: number;
  dimensions?: any;
  barcode?: string;
  images?: string[];
  isDefault?: boolean;
  isActive?: boolean;
  attributes: Array<{
    attributeId: string;
    value: string;
    displayValue?: string;
  }>;
}

export interface UpdateVariantRequest {
  sku?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  stock?: number;
  reservedStock?: number;
  weight?: number;
  dimensions?: any;
  barcode?: string;
  images?: string[];
  isDefault?: boolean;
  isActive?: boolean;
  attributes?: Array<{
    attributeId: string;
    value: string;
    displayValue?: string;
  }>;
}

export interface CreateVariantsBulkRequest {
  productId: string;
  attributes: Array<{
    attributeId: string;
    values: string[]; // 该属性的所有可能值
  }>;
  basePrice?: number;
  defaultStock?: number;
  skuPattern?: string; // SKU 生成模式，如 "PROD-{attr1}-{attr2}"
  priceRules?: Record<string, Record<string, number>>; // {attributeId: {value: priceAdjustment}} 价格规则
  variantPrices?: Array<{
    combination: Array<{ attributeId: string; value: string }>; // 属性组合
    price: number; // 该组合的价格
  }>; // 或者直接指定每个组合的价格
}

export interface CreateAttributeTemplateRequest {
  name: string;
  categoryId?: string;
  attributes: any;
  isDefault?: boolean;
}

export interface GenerateSKURequest {
  productId: string;
  pattern: string; // 如 "PROD-{color}-{size}"
  attributes: Array<{
    attributeId: string;
    value: string;
  }>;
}

