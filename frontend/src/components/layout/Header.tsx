import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { getImageUrl } from '@/utils/imageUrl';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container-apple">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-semibold text-text-primary">Store</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/products"
              className="text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {t('navigation.products')}
            </Link>
            <Link
              to="/about"
              className="text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {t('navigation.about')}
            </Link>
            <Link
              to="/contact"
              className="text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {t('navigation.contact')}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Switcher - Desktop only */}
            <div className="hidden md:block">
              <LanguageSwitcher variant="desktop" />
            </div>

            {/* Search */}
            <button className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-200">
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 text-sm font-medium text-brand-blue hover:text-brand-blue/80 transition-colors duration-200"
                  >
                    {t('navigation.admin')}
                  </Link>
                )}
                
                {/* User Avatar and Name */}
                <Link
                  to="/user/profile"
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-brand-blue to-purple-500 flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 如果图片加载失败，显示首字母
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <span class="text-white text-xs font-semibold">
                                ${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}
                              </span>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-white text-xs font-semibold">
                        {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                      </span>
                    )}
                  </div>
                  
                  {/* Name - Desktop only */}
                  <span className="hidden sm:block text-sm font-medium text-text-primary group-hover:text-brand-blue transition-colors">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  {t('buttons.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    {t('buttons.login')}
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="primary" size="sm">
                    {t('buttons.signUp')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/products"
                className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.products')}
              </Link>
              <Link
                to="/about"
                className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.about')}
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.contact')}
              </Link>
              
              {/* Language Switcher - Mobile */}
              <div className="px-4 pt-2 border-t border-gray-200 mt-2">
                <LanguageSwitcher variant="mobile" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


