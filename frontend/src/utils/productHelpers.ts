/**
 * 统一库存数字转换逻辑
 * 确保库存是非负整数，与后端 normalizeStock 保持一致
 * @param stock - 库存值（可能是数字、字符串或其他类型）
 * @returns 处理后的库存数字（非负整数）
 */
export function normalizeStock(stock: any): number {
  if (typeof stock === 'number') {
    return Math.max(0, Math.floor(stock));
  }
  
  if (stock !== undefined && stock !== null && stock !== '') {
    // 如果是字符串，先清理再转换
    if (typeof stock === 'string') {
      const cleaned = stock.replace(/[^\d.-]/g, ''); // 移除非数字字符（保留负号和小数点用于转换）
      const num = Number(cleaned);
      if (!isNaN(num)) {
        return Math.max(0, Math.floor(num)); // 确保非负整数
      }
    } else {
      const num = Number(stock);
      if (!isNaN(num)) {
        return Math.max(0, Math.floor(num)); // 确保非负整数
      }
    }
  }
  
  return 0;
}

/**
 * 统一图片数组处理逻辑
 * 与后端 normalizeImages 保持一致
 * @param images - 图片值（可能是数组、字符串或其他类型）
 * @returns 处理后的图片URL数组
 */
export function normalizeImages(images: any): string[] {
  if (Array.isArray(images)) {
    return images
      .filter((img: any) => img !== null && img !== undefined && img !== '')
      .map((img: any) => String(img).trim())
      .filter((img: string) => img.length > 0);
  }

  if (images !== null && images !== undefined && images !== '') {
    const imageStr = String(images).trim();
    if (imageStr.length > 0) {
      // 支持逗号分隔的多个URL
      return imageStr.split(',')
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0);
    }
  }
  return [];
}

