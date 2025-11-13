/**
 * Token 辅助工具
 * 用于检查和验证 token 状态
 */

import jwtDecode from 'jwt-decode';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp: number; // 过期时间（Unix 时间戳）
  iat?: number; // 签发时间
}

/**
 * 检查 token 是否过期
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000; // 转换为秒
    
    // 如果 token 在 1 分钟内过期，也认为即将过期
    const bufferTime = 60; // 1分钟缓冲
    return decoded.exp < (currentTime + bufferTime);
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // 如果解码失败，认为已过期
  }
}

/**
 * 获取 token 的剩余有效时间（秒）
 */
export function getTokenRemainingTime(token: string | null): number {
  if (!token) {
    return 0;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    return Math.max(0, decoded.exp - currentTime);
  } catch (error) {
    return 0;
  }
}

/**
 * 检查 token 是否即将过期（5分钟内）
 */
export function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const remainingTime = getTokenRemainingTime(token);
  return remainingTime < 300; // 5分钟
}

/**
 * 从 token 中提取用户信息
 */
export function getUserFromToken(token: string | null): TokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

