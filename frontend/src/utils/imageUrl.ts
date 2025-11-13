/**
 * 图片 URL 处理工具
 * 统一处理本地存储和 Cloudinary 的图片 URL
 * 
 * 核心原则：
 * 1. 本地开发：使用 Vite 代理（/uploads -> localhost:3001/uploads），避免跨域
 * 2. 生产环境：相对路径需要添加后端基础 URL
 * 3. Cloudinary URL：直接使用（已经是完整 URL）
 */

/**
 * 获取图片的完整 URL
 * @param url 图片 URL（可能是相对路径、完整 URL 或 Cloudinary URL）
 * @returns 完整的图片 URL
 */
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) {
    return '';
  }

  // 如果已经是完整的 URL（http:// 或 https://），直接返回
  // 这包括 Cloudinary URL 和已经构建好的完整 URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 如果是相对路径（以 / 开头）
  if (url.startsWith('/')) {
    // 本地开发环境：使用 Vite 代理
    // Vite 配置了 /uploads -> localhost:3001/uploads 的代理
    // 所以相对路径会自动通过代理，避免跨域问题
    if (import.meta.env.DEV) {
      return url;
    }
    
    // 生产环境：需要添加后端基础 URL
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl) {
      // 去掉 /api 后缀，添加图片路径
      const baseUrl = apiUrl.replace('/api', '');
      return `${baseUrl}${url}`;
    }
    
    // 如果没有配置 API URL，返回相对路径（可能会失败，但至少不会报错）
    return url;
  }

  // 其他情况直接返回
  return url;
};

/**
 * 检查是否是 Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

/**
 * 检查是否是本地存储 URL
 */
export const isLocalStorageUrl = (url: string): boolean => {
  return url.includes('/uploads/') || url.startsWith('/uploads/');
};

