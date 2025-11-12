import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

// 獲取項目根目錄（無論是開發環境還是編譯後的環境）
const projectRoot = process.cwd();

// 初始化 i18next
i18next
  .use(Backend)
  .init({
    lng: 'en', // 預設語言
    fallbackLng: 'en', // 回退語言
    supportedLngs: ['en', 'zh-TW', 'zh-CN', 'ja'], // 支援的語言
    defaultNS: 'common', // 預設命名空間
    ns: ['common', 'auth', 'products', 'orders', 'users', 'categories', 'validation'], // 命名空間
    backend: {
      loadPath: path.join(projectRoot, 'src/i18n/locales/{{lng}}/{{ns}}.json'),
    },
    interpolation: {
      escapeValue: false, // React 已經處理了 XSS
    },
    detection: {
      order: ['header'], // 從 header 讀取
      lookupHeader: 'accept-language', // 從 Accept-Language header 讀取
    },
  });

// 擴展 Express Request 類型
declare global {
  namespace Express {
    interface Request {
      language?: string;
      t: (key: string, options?: any) => string | any;
    }
  }
}

// 中間件：從 header 讀取語言並設置到 request
export const i18nMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 從 Accept-Language header 讀取語言
  const acceptLanguage = req.headers['accept-language'];
  let language = 'en'; // 預設語言

  if (acceptLanguage) {
    // 解析 Accept-Language header (例如: "zh-TW,zh;q=0.9,en;q=0.8")
    const languages = acceptLanguage.split(',').map((lang) => {
      const [code, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', ''));
      return { code: code.trim(), quality };
    });

    // 按品質排序
    languages.sort((a, b) => b.quality - a.quality);

    // 找到第一個支援的語言
    const supportedLngs = ['en', 'zh-TW', 'zh-CN', 'ja'];
    for (const lang of languages) {
      // 檢查完整語言代碼 (例如: zh-TW)
      if (supportedLngs.includes(lang.code)) {
        language = lang.code;
        break;
      }
      // 檢查語言前綴 (例如: zh)
      const langPrefix = lang.code.split('-')[0];
      if (langPrefix === 'zh') {
        // 預設使用繁體中文
        language = 'zh-TW';
        break;
      }
    }
  }

  // 設置語言到 i18next
  i18next.changeLanguage(language);

  // 將翻譯函數綁定到 request
  req.language = language;
  req.t = (key: string, options?: any): string => {
    return i18next.t(key, { lng: language, ...options }) as string;
  };

  next();
};

export default i18next;

