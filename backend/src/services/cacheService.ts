import NodeCache from 'node-cache';

// 创建缓存实例
// stdTTL: 默认TTL（秒），checkperiod: 检查过期的时间间隔（秒）
const cache = new NodeCache({
  stdTTL: 300, // 5分钟默认过期时间
  checkperiod: 60, // 每60秒检查一次过期
  useClones: false, // 不使用克隆，提升性能
});

export class CacheService {
  /**
   * 获取缓存
   */
  static get<T>(key: string): T | undefined {
    return cache.get<T>(key);
  }

  /**
   * 设置缓存
   */
  static set<T>(key: string, value: T, ttl?: number): boolean {
    return cache.set(key, value, ttl || 300);
  }

  /**
   * 删除缓存
   */
  static delete(key: string): number {
    return cache.del(key);
  }

  /**
   * 获取所有缓存键
   */
  static getAllKeys(): string[] {
    return cache.keys();
  }

  /**
   * 根据前缀删除缓存
   */
  static deleteByPrefix(prefix: string): number {
    const keys = cache.keys();
    let deleted = 0;
    keys.forEach(key => {
      if (String(key).startsWith(prefix)) {
        cache.del(key);
        deleted++;
      }
    });
    return deleted;
  }

  /**
   * 清空所有缓存
   */
  static flush(): void {
    cache.flushAll();
  }

  /**
   * 获取或设置缓存（如果不存在则执行函数并缓存结果）
   */
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * 生成缓存键
   */
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }
}

// 缓存键前缀常量
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: 'product',
  CATEGORIES: 'categories',
  CATEGORY: 'category',
  ORDERS: 'orders',
  ORDER: 'order',
} as const;

