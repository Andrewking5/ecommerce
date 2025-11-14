import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/layout/AdminLayout'

// 公开路由 - 立即加载
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import AuthCallback from '@/pages/AuthCallback'
import Privacy from '@/pages/Privacy'
import DataDeletion from '@/pages/DataDeletion'
import NotFound from '@/pages/NotFound'

// 受保护路由 - 懒加载
const Checkout = lazy(() => import('@/pages/Checkout'))
const CheckoutSuccess = lazy(() => import('@/pages/CheckoutSuccess'))
const CheckoutCancel = lazy(() => import('@/pages/CheckoutCancel'))
const Profile = lazy(() => import('@/pages/Profile'))
const Addresses = lazy(() => import('@/pages/Addresses'))
const Orders = lazy(() => import('@/pages/Orders'))
const OrderDetail = lazy(() => import('@/pages/OrderDetail'))

// 管理后台路由 - 懒加载
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminInventory = lazy(() => import('@/pages/admin/AdminInventory'))
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminTrash = lazy(() => import('@/pages/admin/AdminTrash'))

function App() {
  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-background-primary">
      <Routes>
        {/* 公開路由 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
        </Route>

        {/* 結帳路由（需要認證） */}
        <Route path="/checkout" element={<Layout />}>
          <Route index element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><Checkout /></Suspense>} />
          <Route path="success" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><CheckoutSuccess /></Suspense>} />
          <Route path="cancel" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><CheckoutCancel /></Suspense>} />
        </Route>

        {/* 認證路由 */}
        <Route path="/auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="callback" element={<AuthCallback />} />
        </Route>

        {/* 法律頁面 */}
        <Route path="/privacy" element={<Layout />}>
          <Route index element={<Privacy />} />
        </Route>
        <Route path="/data-deletion" element={<Layout />}>
          <Route index element={<DataDeletion />} />
        </Route>

        {/* 受保護路由 */}
        <Route path="/user" element={<Layout />}>
          <Route path="profile" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><Profile /></Suspense>} />
          <Route path="addresses" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><Addresses /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><Orders /></Suspense>} />
          <Route path="orders/:id" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><OrderDetail /></Suspense>} />
        </Route>

        {/* 管理員路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminDashboard /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminProducts /></Suspense>} />
          <Route path="products/new" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminProductForm /></Suspense>} />
          <Route path="products/:id/edit" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminProductForm /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminCategories /></Suspense>} />
          <Route path="inventory" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminInventory /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminOrders /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminUsers /></Suspense>} />
          <Route path="trash" element={<Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}><AdminTrash /></Suspense>} />
        </Route>

        {/* 404 頁面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Toast 通知 - 优化为不干扰用户操作 */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2000, // 缩短显示时间到2秒
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#34C759',
              secondary: '#fff',
            },
            duration: 2000,
          },
          error: {
            iconTheme: {
              primary: '#FF3B30',
              secondary: '#fff',
            },
            duration: 3000, // 错误信息稍长一点
          },
        }}
        containerStyle={{
          bottom: '20px',
          right: '20px',
        }}
      />
    </div>
    </ErrorBoundary>
  )
}

export default App


