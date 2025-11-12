import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 導入翻譯資源
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enProducts from './locales/en/products.json';
import enCart from './locales/en/cart.json';
import enOrders from './locales/en/orders.json';
import enAdmin from './locales/en/admin.json';
import enErrors from './locales/en/errors.json';
import enValidation from './locales/en/validation.json';

import zhTWCommon from './locales/zh-TW/common.json';
import zhTWAuth from './locales/zh-TW/auth.json';
import zhTWProducts from './locales/zh-TW/products.json';
import zhTWCart from './locales/zh-TW/cart.json';
import zhTWOrders from './locales/zh-TW/orders.json';
import zhTWAdmin from './locales/zh-TW/admin.json';
import zhTWErrors from './locales/zh-TW/errors.json';
import zhTWValidation from './locales/zh-TW/validation.json';

import zhCNCommon from './locales/zh-CN/common.json';
import zhCNAuth from './locales/zh-CN/auth.json';
import zhCNProducts from './locales/zh-CN/products.json';
import zhCNCart from './locales/zh-CN/cart.json';
import zhCNOrders from './locales/zh-CN/orders.json';
import zhCNAdmin from './locales/zh-CN/admin.json';
import zhCNErrors from './locales/zh-CN/errors.json';
import zhCNValidation from './locales/zh-CN/validation.json';

import jaCommon from './locales/ja/common.json';
import jaAuth from './locales/ja/auth.json';
import jaProducts from './locales/ja/products.json';
import jaCart from './locales/ja/cart.json';
import jaOrders from './locales/ja/orders.json';
import jaAdmin from './locales/ja/admin.json';
import jaErrors from './locales/ja/errors.json';
import jaValidation from './locales/ja/validation.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    products: enProducts,
    cart: enCart,
    orders: enOrders,
    admin: enAdmin,
    errors: enErrors,
    validation: enValidation,
  },
  'zh-TW': {
    common: zhTWCommon,
    auth: zhTWAuth,
    products: zhTWProducts,
    cart: zhTWCart,
    orders: zhTWOrders,
    admin: zhTWAdmin,
    errors: zhTWErrors,
    validation: zhTWValidation,
  },
  'zh-CN': {
    common: zhCNCommon,
    auth: zhCNAuth,
    products: zhCNProducts,
    cart: zhCNCart,
    orders: zhCNOrders,
    admin: zhCNAdmin,
    errors: zhCNErrors,
    validation: zhCNValidation,
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    products: jaProducts,
    cart: jaCart,
    orders: jaOrders,
    admin: jaAdmin,
    errors: jaErrors,
    validation: jaValidation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // 預設語言為英文
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'products', 'cart', 'orders', 'admin', 'errors', 'validation'],
    interpolation: {
      escapeValue: false, // React 已經處理了 XSS
    },
    detection: {
      order: ['localStorage'], // 只從 localStorage 讀取，不從瀏覽器語言檢測
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;

