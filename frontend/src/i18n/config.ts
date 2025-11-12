import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enProducts from '../locales/en/products.json';
import enCart from '../locales/en/cart.json';
import enOrders from '../locales/en/orders.json';
import enAdmin from '../locales/en/admin.json';

import zhTWCommon from '../locales/zh-TW/common.json';
import zhTWAuth from '../locales/zh-TW/auth.json';
import zhTWProducts from '../locales/zh-TW/products.json';
import zhTWCart from '../locales/zh-TW/cart.json';
import zhTWOrders from '../locales/zh-TW/orders.json';
import zhTWAdmin from '../locales/zh-TW/admin.json';

import zhCNCommon from '../locales/zh-CN/common.json';
import zhCNAuth from '../locales/zh-CN/auth.json';
import zhCNProducts from '../locales/zh-CN/products.json';
import zhCNCart from '../locales/zh-CN/cart.json';
import zhCNOrders from '../locales/zh-CN/orders.json';
import zhCNAdmin from '../locales/zh-CN/admin.json';

import jaCommon from '../locales/ja/common.json';
import jaAuth from '../locales/ja/auth.json';
import jaProducts from '../locales/ja/products.json';
import jaCart from '../locales/ja/cart.json';
import jaOrders from '../locales/ja/orders.json';
import jaAdmin from '../locales/ja/admin.json';

// 支持的语言
export const SUPPORTED_LANGUAGES = ['en', 'zh-TW', 'zh-CN', 'ja'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// 语言资源
const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    products: enProducts,
    cart: enCart,
    orders: enOrders,
    admin: enAdmin,
  },
  'zh-TW': {
    common: zhTWCommon,
    auth: zhTWAuth,
    products: zhTWProducts,
    cart: zhTWCart,
    orders: zhTWOrders,
    admin: zhTWAdmin,
  },
  'zh-CN': {
    common: zhCNCommon,
    auth: zhCNAuth,
    products: zhCNProducts,
    cart: zhCNCart,
    orders: zhCNOrders,
    admin: zhCNAdmin,
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    products: jaProducts,
    cart: jaCart,
    orders: jaOrders,
    admin: jaAdmin,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: ['common', 'auth', 'products', 'cart', 'orders', 'admin'],
    
    interpolation: {
      escapeValue: false, // React 已经转义了
    },
    
    detection: {
      // 检测顺序
      order: ['localStorage', 'navigator', 'htmlTag'],
      // localStorage 键名
      lookupLocalStorage: 'i18nextLng',
      // 缓存用户选择
      caches: ['localStorage'],
    },
    
    // 支持的语言
    supportedLngs: SUPPORTED_LANGUAGES,
    
    // 非显式语言时回退到默认语言
    nonExplicitSupportedLngs: false,
  });

export default i18n;

