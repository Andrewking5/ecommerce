import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// 支持的语言
const SUPPORTED_LANGUAGES = ['en', 'zh-TW', 'zh-CN', 'ja'];
const DEFAULT_LANGUAGE = 'en';

// 翻译缓存
const translationsCache: Record<string, Record<string, any>> = {};

/**
 * 加载翻译文件
 */
const loadTranslations = (locale: string): Record<string, any> => {
  if (translationsCache[locale]) {
    return translationsCache[locale];
  }

  const localePath = path.join(__dirname, '../locales', `${locale}.json`);
  
  try {
    if (fs.existsSync(localePath)) {
      const content = fs.readFileSync(localePath, 'utf-8');
      const translations = JSON.parse(content);
      translationsCache[locale] = translations;
      return translations;
    }
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
  }

  // 如果加载失败，尝试加载默认语言
  if (locale !== DEFAULT_LANGUAGE) {
    return loadTranslations(DEFAULT_LANGUAGE);
  }

  return {};
};

/**
 * 获取翻译文本
 * @param req Express Request 对象
 * @param key 翻译键（支持点号分隔的路径，如 'errors.userExists'）
 * @param defaultValue 默认值（如果找不到翻译）
 */
export const t = (req: Request, key: string, defaultValue?: string): string => {
  const locale = req.locale || DEFAULT_LANGUAGE;
  const translations = loadTranslations(locale);
  
  // 支持点号分隔的路径
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果找不到，尝试使用默认语言
      if (locale !== DEFAULT_LANGUAGE) {
        return t({ ...req, locale: DEFAULT_LANGUAGE } as Request, key, defaultValue);
      }
      return defaultValue || key;
    }
  }
  
  return typeof value === 'string' ? value : (defaultValue || key);
};

/**
 * 验证语言代码
 */
export const isValidLanguage = (lang: string): boolean => {
  return SUPPORTED_LANGUAGES.includes(lang);
};

/**
 * 获取默认语言
 */
export const getDefaultLanguage = (): string => {
  return DEFAULT_LANGUAGE;
};

/**
 * 获取支持的语言列表
 */
export const getSupportedLanguages = (): string[] => {
  return [...SUPPORTED_LANGUAGES];
};

