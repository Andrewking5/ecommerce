import { Request, Response, NextFunction } from 'express';

// 支持的语言列表
const SUPPORTED_LANGUAGES = ['en', 'zh-TW', 'zh-CN', 'ja'];
const DEFAULT_LANGUAGE = 'en';

// 扩展 Request 类型以包含 locale
declare global {
  namespace Express {
    interface Request {
      locale?: string;
    }
  }
}

/**
 * 语言检测中间件
 * 优先级：
 * 1. 查询参数 ?lang=xx
 * 2. Accept-Language header
 * 3. 默认语言 (en)
 */
export const languageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. 检查查询参数
  const queryLang = req.query.lang as string;
  if (queryLang && SUPPORTED_LANGUAGES.includes(queryLang)) {
    req.locale = queryLang;
    return next();
  }

  // 2. 检查 Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    // 解析 Accept-Language: en-US,en;q=0.9,zh-TW;q=0.8
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, q = 'q=1'] = lang.trim().split(';');
        const quality = parseFloat(q.replace('q=', ''));
        return { code: code.trim().toLowerCase(), quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // 查找支持的语言
    for (const { code } of languages) {
      // 完全匹配
      if (SUPPORTED_LANGUAGES.includes(code)) {
        req.locale = code;
        return next();
      }
      // 部分匹配（例如 zh-CN 匹配 zh）
      const baseCode = code.split('-')[0];
      if (baseCode === 'zh') {
        // 默认使用繁体中文
        req.locale = 'zh-TW';
        return next();
      }
      if (baseCode === 'en') {
        req.locale = 'en';
        return next();
      }
      if (baseCode === 'ja') {
        req.locale = 'ja';
        return next();
      }
    }
  }

  // 3. 使用默认语言
  req.locale = DEFAULT_LANGUAGE;
  next();
};

