import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/layout/AdminLayout'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import AuthCallback from '@/pages/AuthCallback'
import Profile from '@/pages/Profile'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminUsers from '@/pages/admin/AdminUsers'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <div className="min-h-screen bg-background-primary">
      <Routes>
        {/* 公開路由 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
        </Route>

        {/* 認證路由 */}
        <Route path="/auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="callback" element={<AuthCallback />} />
        </Route>

        {/* 受保護路由 */}
        <Route path="/user" element={<Layout />}>
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>

        {/* 管理員路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* 404 頁面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Toast 通知 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#34C759',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3B30',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default App


