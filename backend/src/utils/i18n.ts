import { Request } from 'express';
import i18next from '../i18n/config';

/**
 * 從 request 獲取翻譯函數
 * @param req Express Request 對象
 * @returns 翻譯函數
 */
export const getTranslator = (req: Request) => {
  const language = req.language || 'en';
  return (key: string, options?: any) => {
    return i18next.t(key, { lng: language, ...options });
  };
};

/**
 * 翻譯函數（用於非請求上下文）
 * @param key 翻譯鍵
 * @param language 語言代碼
 * @param options 選項
 * @returns 翻譯後的文字
 */
export const t = (key: string, language: string = 'en', options?: any) => {
  return i18next.t(key, { lng: language, ...options });
};


