import React, { useEffect } from 'react';
import { Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type SupportedLanguage } from '@/i18n/config';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AuthCallback from '@/pages/AuthCallback';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';
import NotFound from '@/pages/NotFound';

/**
 * 语言路由包装器
 * 处理语言前缀和语言初始化
 */
const LanguageRoute: React.FC = () => {
  const { locale } = useParams<{ locale?: string }>();
  const { i18n } = useTranslation();
  const { initializeLanguage } = useLanguage();

  useEffect(() => {
    // 初始化语言
    initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    // 如果 URL 中有语言代码，更新 i18n
    if (locale && SUPPORTED_LANGUAGES.includes(locale as SupportedLanguage)) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/*" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
      </Route>

      {/* 认证路由 */}
      <Route path="auth/*">
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="callback" element={<AuthCallback />} />
      </Route>

      {/* 受保护路由 */}
      <Route path="user/*" element={<Layout />}>
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>

      {/* 管理员路由 */}
      <Route path="admin/*" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* 404 页面 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

/**
 * 语言路由重定向组件
 * 处理不带语言前缀的 URL，重定向到带语言前缀的 URL
 */
export const LanguageRedirect: React.FC = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  
  const currentLang = SUPPORTED_LANGUAGES.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : DEFAULT_LANGUAGE;

  // 如果路径已经包含语言前缀，不需要重定向
  const hasLanguagePrefix = SUPPORTED_LANGUAGES.some(
    lang => location.pathname.startsWith(`/${lang}/`) || location.pathname === `/${lang}`
  );

  if (hasLanguagePrefix) {
    return null;
  }

  // 构建带语言前缀的路径
  const newPath = currentLang === DEFAULT_LANGUAGE
    ? location.pathname
    : `/${currentLang}${location.pathname === '/' ? '' : location.pathname}`;

  return <Navigate to={newPath} replace />;
};

export default LanguageRoute;

