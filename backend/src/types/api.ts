/**
 * 统一的API响应类型定义
 */

// 基础响应结构
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  meta?: any;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 错误响应
export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  error?: string;
  stack?: string;
  meta?: any;
}

// 成功响应
export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

// 列表响应
export interface ListResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// 单个资源响应
export interface SingleResponse<T> {
  success: true;
  data: T;
}

// 创建响应
export interface CreateResponse<T> {
  success: true;
  message: string;
  data: T;
}

// 更新响应
export interface UpdateResponse<T> {
  success: true;
  message: string;
  data: T;
}

// 删除响应
export interface DeleteResponse {
  success: true;
  message: string;
}

