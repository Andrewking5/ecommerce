import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Menu, 
  X,
  LogOut,
  ChevronRight,
  Home,
  FolderTree
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation('admin');

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('menu.dashboard') },
    { path: '/admin/products', icon: Package, label: t('menu.products') },
    { path: '/admin/categories', icon: FolderTree, label: t('menu.categories') },
    { path: '/admin/orders', icon: ShoppingBag, label: t('menu.orders') },
    { path: '/admin/users', icon: Users, label: t('menu.users') },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 fixed h-screen z-40`}
      >
        <div className="flex flex-col h-full">
          {/* Logo 和切换按钮 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {sidebarOpen && (
              <div className="flex items-center space-x-2 flex-1">
                <Link
                  to="/"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  title={t('menu.dashboard', { defaultValue: 'Back to Home' })}
                >
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <span className="text-lg font-semibold text-text-primary">{t('menu.dashboard', { defaultValue: 'Admin Panel' })}</span>
                </Link>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* 用户信息 */}
          {sidebarOpen && user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* 导航菜单 */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {/* 返回首页链接 */}
              <li>
                <Link
                  to="/"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                >
                  <Home size={20} />
                  {sidebarOpen && <span className="flex-1">返回首页</span>}
                </Link>
              </li>
              
              {/* 分隔线 */}
              {sidebarOpen && (
                <li className="my-2">
                  <div className="h-px bg-gray-200"></div>
                </li>
              )}

              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-brand-blue text-white shadow-sm'
                          : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                      }`}
                    >
                      <Icon size={20} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {active && <ChevronRight size={16} />}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 退出按钮 */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-all duration-200"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>退出登录</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

