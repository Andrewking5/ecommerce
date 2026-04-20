import { LayoutDashboard, ShoppingBag, Package, Users, Megaphone, ChevronDown, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import { useLocalizedNavigate as useNavigate } from '@/src/lib/i18nRouting';
import { useAuth } from '@/src/contexts/AuthContext';
import { ESPRESSO, ESPRESSO_DARK, type Tab, type SidebarItem } from './constants';
import AdminLoader from './components/AdminLoader';
import DashboardTab from './tabs/DashboardTab';
import OrdersTab from './tabs/OrdersTab';
import ProductsTab from './tabs/ProductsTab';
import CategoriesTab from './tabs/CategoriesTab';
import InventoryTab from './tabs/InventoryTab';
import CustomersTab from './tabs/CustomersTab';
import BannersTab from './tabs/BannersTab';
import ReviewsTab from './tabs/ReviewsTab';
import CouponsTab from './tabs/CouponsTab';
import EventsTab from './tabs/EventsTab';

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'dashboard', icon: <LayoutDashboard size={18} />, labelKey: 'admin.sidebar.dashboard' },
  { id: 'orders', icon: <ShoppingBag size={18} />, labelKey: 'admin.sidebar.orders' },
  {
    id: 'products-group', icon: <Package size={18} />, labelKey: 'admin.sidebar.products',
    children: [
      { id: 'products', labelKey: 'admin.sidebar.productsList' },
      { id: 'categories', labelKey: 'admin.sidebar.categories' },
      { id: 'inventory', labelKey: 'admin.sidebar.inventory' },
    ],
  },
  { id: 'customers', icon: <Users size={18} />, labelKey: 'admin.sidebar.customers' },
  {
    id: 'marketing-group', icon: <Megaphone size={18} />, labelKey: 'admin.sidebar.marketing',
    children: [
      { id: 'banners', labelKey: 'admin.sidebar.banners' },
      { id: 'coupons', labelKey: 'admin.sidebar.coupons' },
      { id: 'reviews', labelKey: 'admin.sidebar.reviews' },
      { id: 'events', labelKey: 'admin.sidebar.events' },
    ],
  },
];

export default function Admin() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) =>
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  const isGroupActive = (item: SidebarItem) =>
    item.children?.some((c) => c.id === activeTab) ?? false;

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) navigate('/login');
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  if (authLoading) return <AdminLoader />;
  if (!isAuthenticated || !isAdmin || !user) return null;

  return (
    <div className="min-h-screen text-white flex flex-col lg:flex-row" style={{ background: ESPRESSO_DARK }}>
      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col" style={{ background: ESPRESSO }}>
        <div className="hidden lg:block p-6 border-b border-white/5">
          <h1 className="text-sm font-bold uppercase tracking-[0.25em] text-ayers-gold">{t('admin.panel')}</h1>
          <p className="text-[10px] text-white/30 mt-1">{t('admin.brandName')}</p>
        </div>
        <nav className="flex-grow p-2 lg:p-4 lg:space-y-1 flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 lg:gap-0 scrollbar-hide">
          {SIDEBAR_ITEMS.map((item) =>
            item.children ? (
              <div key={item.id} className="lg:w-full">
                <button
                  onClick={() => toggleGroup(item.id)}
                  className={cn(
                    'flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap lg:w-full',
                    isGroupActive(item) ? 'text-ayers-gold' : 'text-white/35 hover:bg-white/5 hover:text-white/70'
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{t(item.labelKey)}</span>
                  <ChevronDown size={14} className={cn('hidden lg:block transition-transform', (expandedGroups[item.id] || isGroupActive(item)) && 'rotate-180')} />
                </button>
                {/* Desktop: collapsible sub-items */}
                <div className={cn('hidden lg:flex flex-col ml-7 mt-0.5 space-y-0.5 overflow-hidden transition-all', (expandedGroups[item.id] || isGroupActive(item)) ? 'max-h-40' : 'max-h-0')}>
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setActiveTab(child.id)}
                      className={cn(
                        'text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                        activeTab === child.id ? 'bg-ayers-gold/10 text-ayers-gold' : 'text-white/30 hover:bg-white/5 hover:text-white/60'
                      )}
                    >
                      {t(child.labelKey)}
                    </button>
                  ))}
                </div>
                {/* Mobile: inline sub-items */}
                {(expandedGroups[item.id] || isGroupActive(item)) && item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setActiveTab(child.id)}
                    className={cn(
                      'lg:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap',
                      activeTab === child.id ? 'bg-ayers-gold/10 text-ayers-gold' : 'text-white/30 hover:bg-white/5 hover:text-white/60'
                    )}
                  >
                    {t(child.labelKey)}
                  </button>
                ))}
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  'flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap lg:w-full',
                  activeTab === item.id
                    ? 'bg-ayers-gold/10 text-ayers-gold'
                    : 'text-white/35 hover:bg-white/5 hover:text-white/70'
                )}
              >
                {item.icon}
                {t(item.labelKey)}
              </button>
            )
          )}
        </nav>
        <div className="hidden lg:flex p-4 border-t border-white/5 items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-ayers-gold/20 flex items-center justify-center text-ayers-gold">
            <User size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[9px] text-white/30">Admin</p>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-grow p-4 sm:p-6 lg:p-10 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'banners' && <BannersTab />}
        {activeTab === 'reviews' && <ReviewsTab />}
        {activeTab === 'coupons' && <CouponsTab />}
        {activeTab === 'events' && <EventsTab />}
      </main>
    </div>
  );
}
