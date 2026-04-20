import { motion } from 'motion/react';
import {
  LayoutDashboard, ShoppingBag, Box, Users, Search, Bell, User,
  ChevronLeft, ChevronRight, TrendingUp, BarChart3, Package, Plus,
  Trash2, RefreshCw, Edit, AlertTriangle, CheckCircle, XCircle,
  Upload, Download, FileSpreadsheet, X, Image, ChevronUp, ChevronDown,
  Eye, EyeOff, Save, MessageSquare, Star, Ticket, Megaphone, CalendarDays,
  MapPin, QrCode, Link, Copy, Check, ExternalLink, FileText, GripVertical,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from '@/src/lib/utils';
import { GuitarSunLoader, FullPageLoader } from '@/src/components/guitar';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { useLocalizedNavigate as useNavigate } from '@/src/lib/i18nRouting';
import { useAuth } from '@/src/contexts/AuthContext';
import orderService, { type Order } from '@/src/services/orderService';
import productService, { type Product, type Category } from '@/src/services/productService';
import userService from '@/src/services/userService';
import type { User as UserType } from '@/src/services/authService';
import bannerService, { type HomeBanner } from '@/src/services/bannerService';
import api from '@/src/services/api';
import reviewService, { type Review } from '@/src/services/reviewService';
import couponService, { type Coupon } from '@/src/services/couponService';
import eventService, { type Event as EventType, type EventAnalytics } from '@/src/services/eventService';
import quizService, { type QuizAnalytics } from '@/src/services/quizService';
import registrationService, { type Registration } from '@/src/services/registrationService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
import { QRCode } from 'react-qrcode-logo';

/* ─── Constants ─── */

const ESPRESSO = '#2a1f14';
const ESPRESSO_DARK = '#1e160d';
const CARD_BG = '#251c12';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'admin.orders.pending', PROCESSING: 'admin.orders.processing', SHIPPED: 'admin.orders.shipped',
  DELIVERED: 'admin.orders.delivered', CANCELLED: 'admin.orders.cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  PROCESSING: 'bg-blue-500/10 text-blue-500',
  SHIPPED: 'bg-indigo-500/10 text-indigo-500',
  DELIVERED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
};

type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'inventory' | 'customers' | 'banners' | 'reviews' | 'coupons' | 'events';

type SidebarItem =
  | { id: Tab; icon: React.ReactNode; labelKey: string; children?: never }
  | { id: string; icon: React.ReactNode; labelKey: string; children: { id: Tab; labelKey: string }[] };

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

/* ─── Main ─── */

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

/* ═══════════════════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════════════════ */

function DashboardTab() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<{ name: string; sales: number }[]>([]);
  const [bodyTypeData, setBodyTypeData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, lowStock: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, productsRes, inventoryRes] = await Promise.all([
          orderService.getAdminOrders({ page: 1, limit: 50 }),
          productService.getProducts({ page: 1, limit: 1 }),
          productService.getLowStock(10, 1, 1).catch(() => ({ success: false, data: { products: [] } })),
        ]);

        if (ordersRes.success) {
          const all = ordersRes.data.orders;
          setOrders(all.slice(0, 5));

          const totalRevenue = all.reduce((sum, o) => sum + Number(o.totalAmount), 0);
          setStats((s) => ({ ...s, totalOrders: ordersRes.data.pagination?.total || all.length, totalRevenue }));

          // Sales by week
          const weekMap = new Map<string, number>();
          all.forEach((o) => {
            const d = new Date(o.createdAt);
            const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
            const key = ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            weekMap.set(key, (weekMap.get(key) || 0) + Number(o.totalAmount));
          });
          setSalesData(Array.from(weekMap.entries()).map(([name, sales]) => ({ name, sales: Math.round(sales) })).slice(-8));

          // Product popularity
          const bodyMap = new Map<string, number>();
          all.forEach((o) => o.orderItems.forEach((it) => {
            const n = it.product?.name || 'Other';
            bodyMap.set(n, (bodyMap.get(n) || 0) + it.quantity);
          }));
          setBodyTypeData(Array.from(bodyMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
            .map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 14) + '…' : name, value })));
        }

        if (productsRes.success) setStats((s) => ({ ...s, totalProducts: productsRes.data.pagination.total }));
        if (inventoryRes.success) setStats((s) => ({ ...s, lowStock: (inventoryRes as any).data?.products?.length || 0 }));
      } catch { /* silent */ } finally { setLoading(false); }
    })();
  }, []);

  const statCards = [
    { label: t('admin.dashboard.totalOrders'), value: stats.totalOrders, icon: <ShoppingBag size={18} />, color: 'text-blue-400' },
    { label: t('admin.dashboard.revenue'), value: `$${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={18} />, color: 'text-green-400' },
    { label: t('admin.dashboard.products'), value: stats.totalProducts, icon: <Package size={18} />, color: 'text-purple-400' },
    { label: t('admin.dashboard.lowStock'), value: stats.lowStock, icon: <AlertTriangle size={18} />, color: 'text-yellow-400' },
  ];

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] mb-6 sm:mb-8">{t('admin.dashboard.title')}</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl border border-white/5" style={{ background: CARD_BG }}
          >
            <div className={cn('mb-3', s.color)}>{s.icon}</div>
            <p className="text-xl sm:text-2xl font-bold">{loading ? '…' : s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title={t('admin.dashboard.salesTrends')}>
          {loading ? <Spinner /> : salesData.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: ESPRESSO, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="sales" stroke="#c5a059" strokeWidth={2.5} dot={{ r: 3, fill: '#c5a059' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyChart icon={<TrendingUp size={40} />} message={t('admin.dashboard.noSalesData')} />}
        </Card>
        <Card title={t('admin.dashboard.popularProducts')}>
          {loading ? <Spinner /> : bodyTypeData.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bodyTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: ESPRESSO, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey="value" fill="#c5a059" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyChart icon={<BarChart3 size={40} />} message={t('admin.dashboard.noProductData')} />}
        </Card>
      </div>

      {/* Recent Orders */}
      <Card title={t('admin.dashboard.recentOrders')} action={<span className="text-ayers-gold text-[10px] font-bold uppercase tracking-widest">{t('admin.dashboard.viewAll')}</span>}>
        <OrderTable orders={orders} loading={loading} compact />
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   ORDERS TAB
   ═══════════════════════════════════════════════════════ */

function OrdersTab() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getAdminOrders({ page: 1, limit: 50 });
      if (res.success) setOrders(res.data.orders);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await orderService.updateOrderStatus(id, status);
      if (res.success) setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'] } : o));
    } catch { /* silent */ } finally { setUpdating(null); }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.orders.title')}</h2>
        <button onClick={fetchOrders} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={16} /></button>
      </div>
      <Card>
        <OrderTable orders={orders} loading={loading} updating={updating} onStatusChange={handleStatusUpdate} />
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   PRODUCTS TAB
   ═══════════════════════════════════════════════════════ */

function ProductsTab() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  // Excel import state
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: Array<{ index: number; error: string }> } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({ page: 1, limit: 100, search: search || undefined }),
        productService.getCategories(),
      ]);
      if (prodRes.success) setProducts(prodRes.data.products);
      if (catRes.success) setCategories(catRes.data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.products.moveToTrash'))) return;
    try {
      await productService.deleteProduct(id);
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch { /* silent */ }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await productService.updateProduct(product.id, { isActive: !product.isActive });
      if (res.success) setProducts((p) => p.map((x) => x.id === product.id ? { ...x, isActive: !x.isActive } : x));
    } catch { /* silent */ }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      if (editingProduct.id) {
        const res = await productService.updateProduct(editingProduct.id, editingProduct);
        if (res.success) {
          setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? { ...p, ...res.data } : p));
          setEditingProduct(null);
        }
      } else {
        const res = await productService.createProduct(editingProduct);
        if (res.success) {
          setEditingProduct(null);
          fetchProducts();
        }
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const openNewProduct = () => {
    setEditingProduct({
      name: '', description: '', price: 0, stock: 0,
      categoryId: categories[0]?.id || '',
      images: [], isActive: true, specifications: {},
    });
  };

  /* ── Excel helpers ── */

  const downloadTemplate = () => {
    const headers = ['商品名稱', '描述', '價格', '分類', '庫存', '圖片URL'];
    const example = ['Ayers SJ-05', '全單板手工吉他', '28000', 'Sun Series', '5', 'https://example.com/img.jpg'];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '商品匯入');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (rows.length === 0) { alert(t('admin.products.emptyFile')); return; }
        setImportPreview(rows);
        setImportResult(null);
      } catch { alert(t('admin.products.parseError')); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    setImportResult(null);
    try {
      const products = importPreview.map((row) => ({
        name: row['商品名稱'] || row['name'] || '',
        description: row['描述'] || row['description'] || '',
        price: Number(row['價格'] || row['price'] || 0),
        category: row['分類'] || row['category'] || '',
        stock: Number(row['庫存'] || row['stock'] || 0),
        images: (row['圖片URL'] || row['images'] || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        isActive: true,
      }));
      const res = await productService.createProductsBulk(products);
      if (res.success) {
        setImportResult({
          success: res.data.summary.success,
          failed: res.data.failed.map((f) => ({ index: f.index, error: f.error })),
        });
        if (res.data.summary.failed === 0) {
          setImportPreview([]);
          setShowImport(false);
        }
        fetchProducts();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || t('admin.products.importFailed'));
    } finally { setImporting(false); }
  };

  const productFormField = (label: string, key: keyof Product, type: 'text' | 'number' | 'textarea' = 'text') => (
    <div className={type === 'textarea' ? 'col-span-full' : ''}>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={(editingProduct as any)?.[key] || ''}
          onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={(editingProduct as any)?.[key] ?? ''}
          onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value } : prev)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
        />
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.products.title')}</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={openNewProduct}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all"
          >
            <Plus size={12} /> {t('admin.products.addProduct', '新增商品')}
          </button>
          <button
            onClick={() => { setShowImport(!showImport); setImportPreview([]); setImportResult(null); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border',
              showImport
                ? 'border-ayers-gold/30 bg-ayers-gold/10 text-ayers-gold'
                : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/20'
            )}
          >
            <FileSpreadsheet size={12} />
            {t('admin.products.excelImport')}
          </button>
          <div className="relative">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.products.searchPlaceholder')}
              className="bg-white/5 border border-white/10 rounded-full py-2 px-8 text-xs focus:outline-none focus:border-ayers-gold transition-all w-full sm:w-48"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={12} />
          </div>
          <button onClick={fetchProducts} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* ── Product Edit / Create Modal ── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !saving && setEditingProduct(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingProduct.id ? t('admin.products.editProduct', '編輯商品') : t('admin.products.newProduct', '新增商品')}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productFormField(t('admin.products.productName', '商品名稱'), 'name')}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.products.category', '分類')}</label>
                <select
                  value={editingProduct.categoryId || ''}
                  onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, categoryId: e.target.value } : prev)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
                >
                  <option value="" className="bg-[#1e160d]">— 選擇分類 —</option>
                  {categories.map((c) => <option key={c.id} value={c.id} className="bg-[#1e160d]">{c.name}</option>)}
                </select>
              </div>
              {productFormField(t('admin.products.price', '價格'), 'price', 'number')}
              {productFormField(t('admin.products.stock', '庫存'), 'stock', 'number')}
              {productFormField(t('admin.products.description', '描述'), 'description', 'textarea')}
              <div className="col-span-full">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.products.images', '圖片 URL')}（每行一個）</label>
                <textarea
                  value={(editingProduct.images || []).join('\n')}
                  onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, images: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) } : prev)}
                  rows={3}
                  placeholder="/images/products/wave/example.png"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none font-mono"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.products.specifications', '規格')}（JSON）</label>
                <textarea
                  value={JSON.stringify(editingProduct.specifications || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const specs = JSON.parse(e.target.value);
                      setEditingProduct((prev) => prev ? { ...prev, specifications: specs } : prev);
                    } catch { /* invalid JSON, ignore */ }
                  }}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none font-mono"
                />
              </div>
            </div>

            {/* Image previews */}
            {editingProduct.images && editingProduct.images.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{t('admin.products.imagePreview', '圖片預覽')}</p>
                <div className="flex gap-2 flex-wrap">
                  {editingProduct.images.map((img, i) => (
                    <img key={i} src={img} alt={`${editingProduct.name || 'Product'} image ${i + 1}`} className="w-16 h-16 rounded-lg object-contain bg-white/5 border border-white/5" />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                {t('admin.products.cancel', '取消')}
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={saving || !editingProduct.name}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all disabled:opacity-50"
              >
                {saving ? <><GuitarSunLoader size={12} /> {t('admin.products.saving', '儲存中...')}</> : <><Save size={12} /> {t('admin.products.save', '儲存')}</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Excel Import Panel ── */}
      {showImport && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card title={t('admin.products.excelBulkImport')} action={
            <button onClick={() => setShowImport(false)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
          }>
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-3">
                <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-ayers-gold/10 hover:text-ayers-gold text-white/50 text-xs font-bold uppercase tracking-widest transition-all">
                  <Download size={14} /> {t('admin.products.downloadTemplate')}
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ayers-gold/10 text-ayers-gold text-xs font-bold uppercase tracking-widest hover:bg-ayers-gold/20 transition-all">
                  <Upload size={14} /> {t('admin.products.selectFile')}
                </button>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
              </div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest">{t('admin.products.fieldHint')}</p>
              {importPreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/50">{t('admin.products.preview', { count: importPreview.length })}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setImportPreview([]); setImportResult(null); }} className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest">
                        {t('admin.products.clear')}
                      </button>
                      <button onClick={handleImport} disabled={importing} className="text-[10px] px-4 py-1.5 rounded-lg bg-ayers-gold text-black font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all disabled:opacity-50 flex items-center gap-1.5">
                        {importing ? <><GuitarSunLoader size={12} /> {t('admin.products.importing')}</> : <>{t('admin.products.confirmImport')}</>}
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0" style={{ background: CARD_BG }}>
                        <tr className="text-[9px] font-bold uppercase tracking-widest text-white/25 border-b border-white/5">
                          <th className="px-3 py-2">#</th>
                          {Object.keys(importPreview[0]).map((k) => <th key={k} className="px-3 py-2">{k}</th>)}
                          {importResult && <th className="px-3 py-2">{t('admin.products.statusLabel')}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, i) => {
                          const fail = importResult?.failed.find((f) => f.index === i + 1);
                          return (
                            <tr key={i} className={cn('border-b border-white/5', fail ? 'bg-red-500/5' : importResult ? 'bg-green-500/5' : '')}>
                              <td className="px-3 py-2 text-white/30">{i + 1}</td>
                              {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 text-white/60 max-w-[150px] truncate">{String(v)}</td>)}
                              {importResult && (
                                <td className="px-3 py-2">
                                  {fail ? <span className="text-red-400 text-[10px]" title={fail.error}><XCircle size={12} className="inline mr-1" />{fail.error}</span>
                                    : <span className="text-green-400"><CheckCircle size={12} /></span>}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {importResult && (
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-green-400">{t('admin.products.success', { count: importResult.success })}</span>
                      {importResult.failed.length > 0 && <span className="text-red-400">{t('admin.products.failed', { count: importResult.failed.length })}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      <Card>
        {loading ? <Spinner /> : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-xs text-white/30 uppercase tracking-widest">{t('admin.products.noProducts')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-5 py-4">{t('admin.products.product')}</th>
                  <th className="px-5 py-4">{t('admin.products.category')}</th>
                  <th className="px-5 py-4">{t('admin.products.price')}</th>
                  <th className="px-5 py-4">{t('admin.products.stock')}</th>
                  <th className="px-5 py-4">{t('admin.products.status')}</th>
                  <th className="px-5 py-4">{t('admin.products.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setEditingProduct({ ...p })}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-contain bg-white/5" />
                        )}
                        <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-xs">{p.category?.name || '—'}</td>
                    <td className="px-5 py-4 text-ayers-gold font-mono">${Number(p.price).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={cn('text-xs font-bold', p.stock <= 5 ? 'text-red-400' : p.stock <= 15 ? 'text-yellow-400' : 'text-white/60')}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={(e) => { e.stopPropagation(); handleToggleActive(p); }} className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest', p.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                        {p.isActive ? t('admin.products.active') : t('admin.products.inactive')}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setEditingProduct({ ...p }); }} className="text-white/30 hover:text-ayers-gold transition-colors" title="Edit"><Edit size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-white/30 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   CATEGORIES TAB
   ═══════════════════════════════════════════════════════ */

function CategoriesTab() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getCategories();
      if (res.success) setCategories(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSave = async () => {
    if (!editingCat) return;
    setSaving(true);
    try {
      if (editingCat.id) {
        const res = await productService.updateCategory(editingCat.id, editingCat);
        if (res.success) {
          setCategories((prev) => prev.map((c) => c.id === editingCat.id ? { ...c, ...res.data } : c));
          setEditingCat(null);
        }
      } else {
        const res = await productService.createCategory(editingCat);
        if (res.success) {
          setEditingCat(null);
          fetchCategories();
        }
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.categories.deleteConfirm', '確定要刪除此分類嗎？'))) return;
    try {
      await productService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const catFormField = (label: string, key: keyof Category, type: 'text' | 'textarea' = 'text') => (
    <div className={type === 'textarea' ? 'col-span-full' : ''}>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={(editingCat as any)?.[key] || ''}
          onChange={(e) => setEditingCat((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none"
        />
      ) : (
        <input
          type="text"
          value={(editingCat as any)?.[key] || ''}
          onChange={(e) => setEditingCat((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
        />
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.sidebar.categories', '商品分類')}</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchCategories} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
          <button
            onClick={() => setEditingCat({ name: '', slug: '', description: '', image: '', isActive: true })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all"
          >
            <Plus size={12} /> {t('admin.categories.addCategory', '新增分類')}
          </button>
        </div>
      </div>

      {/* ── Edit / Create Modal ── */}
      {editingCat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !saving && setEditingCat(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingCat.id ? t('admin.categories.editCategory', '編輯分類') : t('admin.categories.newCategory', '新增分類')}</h3>
              <button onClick={() => setEditingCat(null)} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {catFormField(t('admin.categories.name', '名稱'), 'name')}
              {catFormField('Slug', 'slug')}
              {catFormField(t('admin.categories.imageUrl', '圖片 URL'), 'image')}
              {catFormField(t('admin.categories.description', '描述'), 'description', 'textarea')}
            </div>
            {editingCat.image && (
              <div className="mt-3">
                <img src={editingCat.image} alt={editingCat.name || 'Category'} className="h-16 rounded-xl object-contain bg-white/5 border border-white/5" />
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingCat(null)} className="px-4 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                {t('admin.categories.cancel', '取消')}
              </button>
              <button onClick={handleSave} disabled={saving || !editingCat.name} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all disabled:opacity-50">
                {saving ? <><GuitarSunLoader size={12} /> {t('admin.categories.saving', '儲存中...')}</> : <><Save size={12} /> {t('admin.categories.save', '儲存')}</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Card>
        {loading ? <Spinner /> : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Box size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-xs text-white/30 uppercase tracking-widest">{t('admin.categories.noCategories', '尚無分類')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-5 py-4">{t('admin.categories.image', '圖片')}</th>
                  <th className="px-5 py-4">{t('admin.categories.name', '名稱')}</th>
                  <th className="px-5 py-4">Slug</th>
                  <th className="px-5 py-4">{t('admin.categories.description', '描述')}</th>
                  <th className="px-5 py-4">{t('admin.categories.products', '商品數')}</th>
                  <th className="px-5 py-4">{t('admin.categories.actions', '操作')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setEditingCat({ ...c })}>
                    <td className="px-5 py-4">
                      {c.image ? <img src={c.image} alt={c.name} className="w-10 h-10 rounded-lg object-contain bg-white/5" /> : <div className="w-10 h-10 rounded-lg bg-white/5" />}
                    </td>
                    <td className="px-5 py-4 font-medium">{c.name}</td>
                    <td className="px-5 py-4 text-white/40 text-xs font-mono">{c.slug}</td>
                    <td className="px-5 py-4 text-white/40 text-xs truncate max-w-[200px]">{c.description || '—'}</td>
                    <td className="px-5 py-4 text-white/60 font-mono">{c.productCount ?? '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setEditingCat({ ...c }); }} className="text-white/30 hover:text-ayers-gold transition-colors" title="Edit"><Edit size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="text-white/30 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   INVENTORY TAB
   ═══════════════════════════════════════════════════════ */

function InventoryTab() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getProducts({ page: 1, limit: 100, sortBy: 'stock', sortOrder: 'asc' });
        if (res.success) setProducts(res.data.products);
      } catch { /* silent */ } finally { setLoading(false); }
    })();
  }, []);

  const handleAdjust = async (id: string, delta: number) => {
    setAdjusting(id);
    try {
      const res = await productService.adjustStock(id, delta);
      if (res.success) {
        setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: p.stock + delta } : p));
      }
    } catch { /* silent */ } finally { setAdjusting(null); }
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] mb-6 sm:mb-8">{t('admin.inventory.title')}</h2>
      <Card>
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-5 py-4">{t('admin.inventory.product')}</th>
                  <th className="px-5 py-4">{t('admin.inventory.currentStock')}</th>
                  <th className="px-5 py-4">{t('admin.inventory.status')}</th>
                  <th className="px-5 py-4">{t('admin.inventory.adjust')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-contain bg-white/5" />}
                        <span className="truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold">{p.stock}</td>
                    <td className="px-5 py-4">
                      {p.stock === 0 ? (
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-red-500/10 text-red-400">{t('admin.inventory.outOfStock')}</span>
                      ) : p.stock <= 10 ? (
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-400">{t('admin.inventory.lowStock')}</span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-green-500/10 text-green-400">{t('admin.inventory.inStock')}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjust(p.id, -1)}
                          disabled={adjusting === p.id || p.stock === 0}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 text-xs font-bold"
                        >−</button>
                        <span className="w-8 text-center font-mono text-xs">{p.stock}</span>
                        <button
                          onClick={() => handleAdjust(p.id, 1)}
                          disabled={adjusting === p.id}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-green-500/10 hover:text-green-400 flex items-center justify-center transition-colors disabled:opacity-30 text-xs font-bold"
                        >+</button>
                        <button
                          onClick={() => handleAdjust(p.id, 10)}
                          disabled={adjusting === p.id}
                          className="ml-2 text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-ayers-gold/10 hover:text-ayers-gold transition-colors font-bold uppercase tracking-widest disabled:opacity-30"
                        >+10</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   CUSTOMERS TAB
   ═══════════════════════════════════════════════════════ */

function CustomersTab() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleConfirm, setRoleConfirm] = useState<{ user: UserType; newRole: 'ADMIN' | 'USER' } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [viewUser, setViewUser] = useState<UserType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ page: 1, limit: 50, search: search || undefined });
      if (res.success) setUsers(res.data.users);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async () => {
    if (!roleConfirm) return;
    setUpdating(true);
    try {
      const res = await userService.updateUser(roleConfirm.user.id, { role: roleConfirm.newRole });
      if (res.success) {
        setUsers((prev) => prev.map((u) => u.id === roleConfirm.user.id ? { ...u, role: roleConfirm.newRole } : u));
      }
    } catch { /* silent */ } finally {
      setUpdating(false);
      setRoleConfirm(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await userService.deleteUser(deleteConfirm.id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
      }
    } catch { /* silent */ } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const detailRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.customers.title')}</h2>
        <div className="relative">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.customers.searchPlaceholder')}
            className="bg-white/5 border border-white/10 rounded-full py-2 px-8 text-xs focus:outline-none focus:border-ayers-gold transition-all w-full sm:w-48"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={12} />
        </div>
      </div>
      <Card>
        {loading ? <Spinner /> : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-xs text-white/30 uppercase tracking-widest">{t('admin.customers.noUsers')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-5 py-4">{t('admin.customers.user')}</th>
                  <th className="px-5 py-4">{t('admin.customers.email')}</th>
                  <th className="px-5 py-4">{t('admin.customers.role')}</th>
                  <th className="px-5 py-4">{t('admin.customers.provider')}</th>
                  <th className="px-5 py-4">{t('admin.customers.joined')}</th>
                  <th className="px-5 py-4">{t('admin.customers.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-ayers-gold/10 flex items-center justify-center text-ayers-gold text-xs font-bold">
                            {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                          </div>
                          <span>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/50 text-xs">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest', u.role === 'ADMIN' ? 'bg-ayers-gold/10 text-ayers-gold' : 'bg-white/5 text-white/40')}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs capitalize">{u.provider || 'local'}</td>
                      <td className="px-5 py-4 text-white/40 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewUser(u)}
                            className="text-white/30 hover:text-ayers-gold transition-colors"
                            title={t('admin.customers.viewDetails')}
                          ><Eye size={14} /></button>
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => setRoleConfirm({ user: u, newRole: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                                className={cn(
                                  'text-white/30 transition-colors',
                                  u.role === 'ADMIN' ? 'hover:text-red-400' : 'hover:text-ayers-gold'
                                )}
                                title={u.role === 'ADMIN' ? t('admin.customers.demoteToUser') : t('admin.customers.promoteToAdmin')}
                              >
                                {u.role === 'ADMIN' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(u)}
                                className="text-white/30 hover:text-red-400 transition-colors"
                                title={t('admin.customers.deleteUser')}
                              ><Trash2 size={14} /></button>
                            </>
                          )}
                          {isSelf && (
                            <span className="text-[10px] text-white/20 italic">{t('admin.customers.you')}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── View User Details Modal ── */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{t('admin.customers.userDetails')}</h3>
              <button onClick={() => setViewUser(null)} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-ayers-gold/10 flex items-center justify-center text-ayers-gold text-xl font-bold">
                {(viewUser.firstName?.[0] || viewUser.email[0]).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold">{viewUser.firstName} {viewUser.lastName}</p>
                <p className="text-xs text-white/40">{viewUser.email}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-0">
              {detailRow(t('admin.customers.role'),
                <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest', viewUser.role === 'ADMIN' ? 'bg-ayers-gold/10 text-ayers-gold' : 'bg-white/5 text-white/40')}>
                  {viewUser.role}
                </span>
              )}
              {detailRow(t('admin.customers.provider'), <span className="capitalize">{viewUser.provider || 'local'}</span>)}
              {detailRow(t('admin.customers.phone'), viewUser.phone || <span className="text-white/20 italic">{t('admin.customers.noPhone')}</span>)}
              {detailRow(t('admin.customers.joined'), new Date(viewUser.createdAt).toLocaleDateString())}
              {detailRow('ID', <span className="font-mono text-xs text-white/40">{viewUser.id}</span>)}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                {t('admin.customers.close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Role Change Confirmation Dialog ── */}
      {roleConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !updating && setRoleConfirm(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', roleConfirm.newRole === 'ADMIN' ? 'bg-ayers-gold/10' : 'bg-red-500/10')}>
                {roleConfirm.newRole === 'ADMIN'
                  ? <ChevronUp className="text-ayers-gold" size={20} />
                  : <ChevronDown className="text-red-400" size={20} />}
              </div>
              <h3 className="text-lg font-bold">
                {roleConfirm.newRole === 'ADMIN' ? t('admin.customers.promoteToAdmin') : t('admin.customers.demoteToUser')}
              </h3>
            </div>
            <p className="text-sm text-white/60 mb-6">
              {t('admin.customers.roleChangeConfirm', {
                action: roleConfirm.newRole === 'ADMIN' ? t('admin.customers.promote').toLowerCase() : t('admin.customers.demote').toLowerCase(),
                name: `${roleConfirm.user.firstName} ${roleConfirm.user.lastName}`,
                email: roleConfirm.user.email,
                role: roleConfirm.newRole,
              })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRoleConfirm(null)} disabled={updating}
                className="px-4 py-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                {t('admin.customers.cancel')}
              </button>
              <button
                onClick={handleRoleChange} disabled={updating}
                className={cn(
                  'px-4 py-2 text-xs uppercase tracking-widest rounded-full font-bold transition-all',
                  roleConfirm.newRole === 'ADMIN'
                    ? 'bg-ayers-gold text-black hover:bg-ayers-gold/80'
                    : 'bg-red-500 text-white hover:bg-red-600',
                  updating && 'opacity-50 cursor-not-allowed'
                )}
              >
                {updating ? t('admin.customers.updating') : t('admin.customers.confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !deleting && setDeleteConfirm(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={20} />
              </div>
              <h3 className="text-lg font-bold">{t('admin.customers.deleteUser')}</h3>
            </div>
            <p className="text-sm text-white/60 mb-6">
              {t('admin.customers.deleteConfirm', {
                name: `${deleteConfirm.firstName} ${deleteConfirm.lastName}`,
                email: deleteConfirm.email,
              })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)} disabled={deleting}
                className="px-4 py-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                {t('admin.customers.cancel')}
              </button>
              <button
                onClick={handleDelete} disabled={deleting}
                className={cn(
                  'px-4 py-2 text-xs uppercase tracking-widest rounded-full font-bold transition-all bg-red-500 text-white hover:bg-red-600',
                  deleting && 'opacity-50 cursor-not-allowed'
                )}
              >
                {deleting ? t('admin.customers.deleting') : t('admin.customers.delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   BANNERS TAB
   ═══════════════════════════════════════════════════════ */

/* ─── Reusable Image Upload Field ─── */
function ImageUploadField({ label, hint, required, value, onChange }: {
  label: string;
  hint?: string;
  required?: boolean;
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success && data.data?.url) {
        onChange(data.data.url);
      }
    } catch {
      // upload failed — UI resets silently
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-[11px] text-white/40 mb-1.5">
        {label} {required && <span className="text-red-400">*必填</span>}
        {hint && <span className="text-white/20 ml-1">({hint})</span>}
      </label>

      {/* Preview + upload area */}
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
          value ? 'border-white/10 bg-white/5' : 'border-white/15 bg-white/[0.02] hover:border-ayers-gold/40',
        )}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {value ? (
          <div className="relative group">
            <img src={value} alt={label} className="w-full h-32 object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white hover:bg-white/30 transition-colors"
              >
                <Upload size={12} className="inline mr-1" />重新上傳
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                className="px-3 py-1.5 bg-red-500/30 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white hover:bg-red-500/50 transition-colors"
              >
                <X size={12} className="inline mr-1" />移除
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center gap-2 text-white/30">
            {uploading ? (
              <><GuitarSunLoader size={20} /><span className="text-[10px]">上傳中...</span></>
            ) : (
              <>
                <Upload size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">點擊上傳圖片</span>
                <span className="text-[9px] text-white/15">支援 JPG、PNG、WebP（最大 10MB）</span>
              </>
            )}
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />

      {/* Toggle URL input for manual entry */}
      <button
        onClick={() => setShowUrlInput(!showUrlInput)}
        className="mt-1.5 text-[9px] text-white/20 hover:text-white/40 transition-colors"
      >
        {showUrlInput ? '隱藏網址輸入' : '或手動輸入網址'}
      </button>
      {showUrlInput && (
        <input
          type="text"
          placeholder="https://... 或 /images/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none focus:border-ayers-gold transition-all"
        />
      )}
    </div>
  );
}

const EMPTY_BANNER: Partial<HomeBanner> = {
  slug: '', placement: 'collections', subtitle: '', titleWord1: '', titleWord2: '',
  titleColor1: '#c5a059', titleColor2: '#ffffff',
  body: '', ctaLabel: '', ctaLink: '', image: '', productImage: '', gradientColor: '#1a1a1a', isActive: true,
};

function BannersTab() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Partial<HomeBanner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const handleToggle = async (id: string) => {
    try {
      const res = await bannerService.toggleBanner(id);
      if (res.success) setBanners((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.banners.deleteBanner'))) return;
    try {
      const res = await bannerService.deleteBanner(id);
      if (res.success) setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch { /* silent */ }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newBanners.length) return;
    [newBanners[index], newBanners[swapIdx]] = [newBanners[swapIdx], newBanners[index]];
    setBanners(newBanners);
    setReordering(true);
    try {
      await bannerService.reorderBanners(newBanners.map((b) => b.id));
    } catch { /* silent */ } finally { setReordering(false); }
  };

  const handleSave = async () => {
    if (!editingBanner) return;
    setSaving(true);
    try {
      if (editingBanner.id) {
        const res = await bannerService.updateBanner(editingBanner.id, editingBanner);
        if (res.success) {
          setBanners((prev) => prev.map((b) => b.id === editingBanner.id ? { ...b, ...editingBanner } as HomeBanner : b));
          setEditingBanner(null);
        }
      } else {
        const res = await bannerService.createBanner(editingBanner);
        if (res.success) {
          setEditingBanner(null);
          fetchBanners();
        }
      }
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const formField = (label: string, key: keyof HomeBanner, type: 'text' | 'color' | 'textarea' = 'text') => (
    <div className={type === 'textarea' ? 'col-span-full' : ''}>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={(editingBanner as any)?.[key] || ''}
          onChange={(e) => setEditingBanner((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none"
        />
      ) : type === 'color' ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(editingBanner as any)?.[key] || '#ffffff'}
            onChange={(e) => setEditingBanner((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
            className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={(editingBanner as any)?.[key] || ''}
            onChange={(e) => setEditingBanner((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all font-mono"
          />
        </div>
      ) : (
        <input
          type="text"
          value={(editingBanner as any)?.[key] || ''}
          onChange={(e) => setEditingBanner((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
        />
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.banners.title')}</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchBanners} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
          <button
            onClick={() => setEditingBanner({ ...EMPTY_BANNER })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all"
          >
            <Plus size={12} /> {t('admin.banners.addBanner')}
          </button>
        </div>
      </div>

      {/* ── Edit / Create Form — Simplified No-Code UI ── */}
      {editingBanner && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card title={editingBanner.id ? '編輯橫幅' : '新增橫幅'} action={
            <button onClick={() => setEditingBanner(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
          }>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-6">

              {/* ── Section 1: Basic Info ── */}
              <div>
                <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">基本設定</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">顯示位置</label>
                    <select
                      value={(editingBanner as any).placement || 'collections'}
                      onChange={(e) => setEditingBanner(prev => prev ? { ...prev, placement: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all"
                    >
                      <option value="home">🏠 首頁</option>
                      <option value="collections">🎸 系列頁 (Collections)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">識別碼 (Slug)</label>
                    <input
                      type="text"
                      placeholder="例：wave-promo"
                      value={editingBanner.slug || ''}
                      onChange={(e) => setEditingBanner(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 2: Content ── */}
              <div>
                <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">文字內容</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">標籤文字 <span className="text-white/20">(小字)</span></label>
                    <input
                      type="text"
                      placeholder="例：NEW ARRIVAL、限時優惠"
                      value={editingBanner.subtitle || ''}
                      onChange={(e) => setEditingBanner(prev => prev ? { ...prev, subtitle: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">標題第一行 <span className="text-white/20">(大字)</span></label>
                    <input
                      type="text"
                      placeholder="例：Wave"
                      value={editingBanner.titleWord1 || ''}
                      onChange={(e) => setEditingBanner(prev => prev ? { ...prev, titleWord1: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">標題第二行</label>
                    <input
                      type="text"
                      placeholder="例：濤系列"
                      value={editingBanner.titleWord2 || ''}
                      onChange={(e) => setEditingBanner(prev => prev ? { ...prev, titleWord2: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-[11px] text-white/40 mb-1.5">說明文字</label>
                  <textarea
                    placeholder="例：聲波如潮水般層疊推進，音色飽滿厚實"
                    value={editingBanner.body || ''}
                    onChange={(e) => setEditingBanner(prev => prev ? { ...prev, body: e.target.value } : prev)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all resize-none"
                  />
                </div>
              </div>

              {/* ── Section 3: Button ── */}
              <div>
                <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">按鈕</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">按鈕文字</label>
                    <input
                      type="text"
                      placeholder="例：探索 Wave 系列"
                      value={editingBanner.ctaLabel || ''}
                      onChange={(e) => setEditingBanner(prev => prev ? { ...prev, ctaLabel: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">按鈕連結</label>
                    <input
                      type="text"
                      placeholder="例：/collections?series=wave"
                      value={editingBanner.ctaLink || ''}
                      onChange={(e) => setEditingBanner(prev => prev ? { ...prev, ctaLink: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 4: Images ── */}
              <div>
                <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">圖片</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploadField
                    label="背景圖片"
                    required
                    hint="建議尺寸 1920×1080，橫式大圖"
                    value={editingBanner.image || ''}
                    onChange={(url) => setEditingBanner(prev => prev ? { ...prev, image: url } : prev)}
                  />
                  <ImageUploadField
                    label="產品圖片"
                    hint="可選，右側浮動吉他（建議去背 PNG）"
                    value={(editingBanner as any).productImage || ''}
                    onChange={(url) => setEditingBanner(prev => prev ? { ...prev, productImage: url } : prev)}
                  />
                </div>
                <div className="mt-4 max-w-xs">
                  <label className="block text-[11px] text-white/40 mb-1.5">遮罩底色 <span className="text-white/20">(文字背後的漸層色)</span></label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={(editingBanner as any).gradientColor || '#1a1a1a'}
                      onChange={(e) => setEditingBanner(prev => prev ? { ...prev, gradientColor: e.target.value } : prev)}
                      className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    />
                    <div className="flex gap-2">
                      {['#1a2a3a', '#2a1a0e', '#1a1a2a', '#0e1a2a', '#1a1a1a'].map(c => (
                        <button
                          key={c}
                          onClick={() => setEditingBanner(prev => prev ? { ...prev, gradientColor: c } : prev)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-ayers-gold transition-colors"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Live Preview ── */}
              {(editingBanner.titleWord1 || editingBanner.image) && (
                <div>
                  <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">即時預覽</h3>
                  <div
                    className="relative rounded-2xl overflow-hidden h-48 flex items-center"
                    style={{ background: (editingBanner as any).gradientColor || '#1a1a1a' }}
                  >
                    {editingBanner.image && (
                      <img src={editingBanner.image} alt={`${editingBanner.titleWord1 || ''} ${editingBanner.titleWord2 || ''}`.trim() || 'Banner'} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    )}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${(editingBanner as any).gradientColor || '#1a1a1a'}, transparent)` }} />
                    <div className="relative z-10 p-6 max-w-sm">
                      {editingBanner.subtitle && (
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-ayers-gold border border-ayers-gold/30 px-2 py-0.5 rounded-full">
                          {editingBanner.subtitle}
                        </span>
                      )}
                      <h3 className="text-2xl font-serif italic font-bold text-white mt-2">
                        {editingBanner.titleWord1} {editingBanner.titleWord2}
                      </h3>
                      {editingBanner.body && <p className="text-xs text-white/50 mt-1">{editingBanner.body}</p>}
                      {editingBanner.ctaLabel && (
                        <span className="inline-block mt-3 bg-ayers-gold text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                          {editingBanner.ctaLabel}
                        </span>
                      )}
                    </div>
                    {(editingBanner as any).productImage && (
                      <img src={(editingBanner as any).productImage} alt="Banner product" className="absolute right-4 top-2 h-44 object-contain drop-shadow-2xl" />
                    )}
                  </div>
                </div>
              )}

              {/* ── Actions ── */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingBanner(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-white/40 text-xs font-bold hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editingBanner.slug || !editingBanner.titleWord1 || !editingBanner.image}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ayers-gold text-black text-xs font-bold hover:bg-ayers-gold/90 transition-all disabled:opacity-30"
                >
                  {saving ? <><GuitarSunLoader size={12} /> 儲存中...</> : <><Save size={12} /> {editingBanner.id ? '更新' : '建立'}</>}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Banners List ── */}
      <Card>
        {loading ? <Spinner /> : banners.length === 0 ? (
          <div className="py-16 text-center">
            <Image size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-xs text-white/30 uppercase tracking-widest">{t('admin.banners.noBanners')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-5 py-4">{t('admin.banners.order')}</th>
                  <th className="px-5 py-4">{t('admin.banners.image')}</th>
                  <th className="px-5 py-4">{t('admin.banners.bannerTitle')}</th>
                  <th className="px-5 py-4">{t('admin.banners.slug')}</th>
                  <th className="px-5 py-4">{t('admin.banners.status')}</th>
                  <th className="px-5 py-4">{t('admin.banners.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b, index) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-white/30 font-mono text-xs w-5 text-center">{b.displayOrder}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0 || reordering}
                            className="text-white/20 hover:text-ayers-gold transition-colors disabled:opacity-20"
                          ><ChevronUp size={12} /></button>
                          <button
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === banners.length - 1 || reordering}
                            className="text-white/20 hover:text-ayers-gold transition-colors disabled:opacity-20"
                          ><ChevronDown size={12} /></button>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {b.image ? (
                        <img src={b.image} alt={`${b.titleWord1 || ''} ${b.titleWord2 || ''}`.trim() || 'Banner'} className="w-16 h-10 rounded-lg object-cover bg-white/5" />
                      ) : (
                        <div className="w-16 h-10 rounded-lg bg-white/5 flex items-center justify-center"><Image size={14} className="text-white/15" /></div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ color: b.titleColor1 }}>{b.titleWord1}</span>
                      {' '}
                      <span style={{ color: b.titleColor2 }}>{b.titleWord2}</span>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs font-mono">{b.slug}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(b.id)}
                        className={cn(
                          'text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1',
                          b.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        )}
                      >
                        {b.isActive ? <><Eye size={10} /> {t('admin.banners.active')}</> : <><EyeOff size={10} /> {t('admin.banners.inactive')}</>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingBanner({ ...b })}
                          className="text-white/30 hover:text-ayers-gold transition-colors" title="Edit"
                        ><Edit size={14} /></button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="text-white/30 hover:text-red-400 transition-colors" title="Delete"
                        ><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   COUPONS TAB
   ═══════════════════════════════════════════════════════ */

const EMPTY_COUPON: Partial<Coupon> = {
  code: '', discountType: 'percentage', discountValue: 0,
  minOrderAmount: undefined, maxUses: undefined, expiresAt: undefined, isActive: true,
};

function CouponsTab() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await couponService.getAll();
      if (res.success) setCoupons(res.data.coupons);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleToggle = async (coupon: Coupon) => {
    try {
      const res = await couponService.update(coupon.id, { isActive: !coupon.isActive });
      if (res.success) setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.coupons.confirmDelete', 'Delete this coupon?'))) return;
    try {
      const res = await couponService.delete(id);
      if (res.success) setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch { /* silent */ }
  };

  const handleSave = async () => {
    if (!editingCoupon) return;
    setSaving(true);
    try {
      const payload = {
        ...editingCoupon,
        discountValue: Number(editingCoupon.discountValue) || 0,
        minOrderAmount: editingCoupon.minOrderAmount ? Number(editingCoupon.minOrderAmount) : undefined,
        maxUses: editingCoupon.maxUses ? Number(editingCoupon.maxUses) : undefined,
        expiresAt: editingCoupon.expiresAt || undefined,
      };
      if (editingCoupon.id) {
        const res = await couponService.update(editingCoupon.id, payload);
        if (res.success) {
          setCoupons((prev) => prev.map((c) => c.id === editingCoupon.id ? { ...c, ...res.data } : c));
          setEditingCoupon(null);
        }
      } else {
        const res = await couponService.create(payload);
        if (res.success) {
          setEditingCoupon(null);
          fetchCoupons();
        }
      }
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const updateField = (key: string, value: any) => {
    setEditingCoupon((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.coupons.title', 'Coupons')}</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchCoupons} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
          <button
            onClick={() => setEditingCoupon({ ...EMPTY_COUPON })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all"
          >
            <Plus size={12} /> {t('admin.coupons.addCoupon', 'New Coupon')}
          </button>
        </div>
      </div>

      {/* ── Edit / Create Form ── */}
      {editingCoupon && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card title={editingCoupon.id ? t('admin.coupons.editCoupon', 'Edit Coupon') : t('admin.coupons.newCoupon', 'New Coupon')} action={
            <button onClick={() => setEditingCoupon(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
          }>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.code', 'Code')}</label>
                  <input
                    type="text"
                    value={editingCoupon.code || ''}
                    onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all uppercase tracking-wider"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.discountType', 'Discount Type')}</label>
                  <select
                    value={editingCoupon.discountType || 'percentage'}
                    onChange={(e) => updateField('discountType', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
                  >
                    <option value="percentage" className="bg-[#1e160d] text-white">{t('admin.coupons.percentage', 'Percentage (%)')}</option>
                    <option value="fixed" className="bg-[#1e160d] text-white">{t('admin.coupons.fixed', 'Fixed Amount')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.discountValue', 'Discount Value')}</label>
                  <input
                    type="number"
                    value={editingCoupon.discountValue || ''}
                    onChange={(e) => updateField('discountValue', e.target.value)}
                    placeholder={editingCoupon.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.minOrder', 'Min Order Amount')}</label>
                  <input
                    type="number"
                    value={editingCoupon.minOrderAmount || ''}
                    onChange={(e) => updateField('minOrderAmount', e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.maxUses', 'Max Uses')}</label>
                  <input
                    type="number"
                    value={editingCoupon.maxUses || ''}
                    onChange={(e) => updateField('maxUses', e.target.value)}
                    placeholder={t('admin.coupons.unlimited', 'Unlimited')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.expiresAt', 'Expires At')}</label>
                  <input
                    type="datetime-local"
                    value={editingCoupon.expiresAt ? editingCoupon.expiresAt.slice(0, 16) : ''}
                    onChange={(e) => updateField('expiresAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  {t('admin.coupons.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all disabled:opacity-50"
                >
                  {saving ? <><GuitarSunLoader size={12} /> {t('admin.coupons.saving', 'Saving...')}</> : <><Save size={12} /> {editingCoupon.id ? t('admin.coupons.update', 'Update') : t('admin.coupons.create', 'Create')}</>}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Coupons List ── */}
      <Card>
        {loading ? <Spinner /> : coupons.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-xs text-white/30 uppercase tracking-widest">{t('admin.coupons.noCoupons', 'No coupons yet')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-5 py-4">{t('admin.coupons.code', 'Code')}</th>
                  <th className="px-5 py-4">{t('admin.coupons.type', 'Type')}</th>
                  <th className="px-5 py-4">{t('admin.coupons.value', 'Value')}</th>
                  <th className="px-5 py-4">{t('admin.coupons.minOrder', 'Min Order')}</th>
                  <th className="px-5 py-4">{t('admin.coupons.usage', 'Usage')}</th>
                  <th className="px-5 py-4">{t('admin.coupons.expires', 'Expires')}</th>
                  <th className="px-5 py-4">{t('admin.coupons.status', 'Status')}</th>
                  <th className="px-5 py-4">{t('admin.coupons.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  return (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-ayers-gold text-xs tracking-wider">{c.code}</td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          'text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest',
                          c.discountType === 'percentage' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                        )}>
                          {c.discountType === 'percentage' ? t('admin.coupons.percentage', '%') : t('admin.coupons.fixed', 'Fixed')}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `NT$ ${Number(c.discountValue).toLocaleString()}`}
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs font-mono">
                        {c.minOrderAmount ? `NT$ ${Number(c.minOrderAmount).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className="text-white/60">{c.usedCount}</span>
                        <span className="text-white/20"> / </span>
                        <span className="text-white/40">{c.maxUses || '∞'}</span>
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs">
                        {c.expiresAt ? (
                          <span className={isExpired ? 'text-red-400' : ''}>
                            {new Date(c.expiresAt).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggle(c)}
                          className={cn(
                            'text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1',
                            c.isActive && !isExpired ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          )}
                        >
                          {c.isActive && !isExpired ? <><Eye size={10} /> {t('admin.coupons.active', 'Active')}</> : <><EyeOff size={10} /> {isExpired ? t('admin.coupons.expired', 'Expired') : t('admin.coupons.inactive', 'Inactive')}</>}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingCoupon({ ...c })}
                            className="text-white/30 hover:text-ayers-gold transition-colors" title="Edit"
                          ><Edit size={14} /></button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-white/30 hover:text-red-400 transition-colors" title="Delete"
                          ><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   REVIEWS TAB
   ═══════════════════════════════════════════════════════ */

const REVIEW_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  APPROVED: 'bg-green-500/10 text-green-500',
  REJECTED: 'bg-red-500/10 text-red-500',
};

function ReviewsTab() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: { page: number; limit: number; status?: string } = { page: 1, limit: 100 };
      if (filterStatus) params.status = filterStatus;
      const res = await reviewService.getAdminReviews(params);
      if (res.success) setReviews(res.data.reviews);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await reviewService.approveReview(id);
      if (res.success) setReviews((prev) => prev.map((r) => r.id === id ? { ...r, isApproved: true } : r));
    } catch { /* silent */ } finally { setActionId(null); }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      const res = await reviewService.rejectReview(id);
      if (res.success) setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch { /* silent */ } finally { setActionId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.reviews.confirmDelete', 'Delete this review?'))) return;
    setActionId(id);
    try {
      const res = await reviewService.deleteReview(id);
      if (res.success) setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch { /* silent */ } finally { setActionId(null); }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={cn(rating >= s ? 'fill-ayers-gold text-ayers-gold' : 'fill-transparent text-white/15')} />
      ))}
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.reviews.title', 'Reviews')}</h2>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[10px] px-3 py-2 rounded-xl font-bold uppercase tracking-widest border border-white/10 bg-transparent text-white/60 focus:outline-none focus:border-ayers-gold/40"
          >
            <option value="" className="bg-[#1e160d]">{t('admin.reviews.all', 'All')}</option>
            <option value="pending" className="bg-[#1e160d]">{t('admin.reviews.pending', 'Pending')}</option>
            <option value="approved" className="bg-[#1e160d]">{t('admin.reviews.approved', 'Approved')}</option>
          </select>
          <button onClick={fetchReviews} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={16} /></button>
        </div>
      </div>

      <Card>
        {loading ? <Spinner /> : reviews.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-xs text-white/30 uppercase tracking-widest">{t('admin.reviews.noReviews', 'No reviews found')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-5 py-4">{t('admin.reviews.product', 'Product')}</th>
                  <th className="px-5 py-4">{t('admin.reviews.user', 'User')}</th>
                  <th className="px-5 py-4">{t('admin.reviews.rating', 'Rating')}</th>
                  <th className="px-5 py-4">{t('admin.reviews.comment', 'Comment')}</th>
                  <th className="px-5 py-4">{t('admin.reviews.status', 'Status')}</th>
                  <th className="px-5 py-4">{t('admin.reviews.date', 'Date')}</th>
                  <th className="px-5 py-4">{t('admin.reviews.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-xs max-w-[160px] truncate">
                      {r.product?.name || r.productId.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4 text-xs text-white/70">
                      {r.user ? `${r.user.firstName} ${r.user.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-4">{renderStars(r.rating)}</td>
                    <td className="px-5 py-4 text-xs text-white/50 max-w-[200px] truncate">{r.comment}</td>
                    <td className="px-5 py-4">
                      <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest', r.isApproved ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500')}>
                        {r.isApproved ? t('admin.reviews.approved', 'Approved') : t('admin.reviews.pending', 'Pending')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {!r.isApproved && (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={actionId === r.id}
                              className={cn('text-green-400 hover:text-green-300 transition-colors', actionId === r.id && 'opacity-40')}
                              title={t('admin.reviews.approve', 'Approve')}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              disabled={actionId === r.id}
                              className={cn('text-red-400 hover:text-red-300 transition-colors', actionId === r.id && 'opacity-40')}
                              title={t('admin.reviews.reject', 'Reject')}
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={actionId === r.id}
                          className={cn('text-white/30 hover:text-red-400 transition-colors', actionId === r.id && 'opacity-40')}
                          title={t('admin.reviews.delete', 'Delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   EVENTS TAB
   ═══════════════════════════════════════════════════════ */

// 活動簡章預設規則（當 DB 尚無資料時自動填入，讓管理者第一次開啟即可直接編輯儲存）
const SOUL_GUITAR_INFO_DEFAULT_RULES = [
  { short: '演奏組上傳 YouTube（必須）及 Instagram / Facebook（擇一）', full: '並將影片標題命名為「參賽曲名_姓名_演奏組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。' },
  { short: '彈唱組上傳 YouTube（必須）及 Instagram / Facebook（擇一）', full: '並將影片標題命名為「參賽曲名_姓名_彈唱組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。' },
  { short: '影片彈唱前需說明', full: '「大家好我是（本名/藝名/團名），今天來參加2026Ayers靈魂吉他手大賽，報名（演奏組/彈唱組），我的靈魂是（xx）吉他魂（⚠️需與身上顏色相同），（想帶給大家的一句話）。比賽曲目是（創作者）的（歌名）。」' },
  { short: '影片 30~120 秒', full: '影片總時長需為 30 秒至 120 秒。' },
  { short: '直式一鏡到底', full: '錄製影像需為直式固定鏡頭一鏡到底，禁止合成、剪輯、運鏡、轉場效果。' },
  { short: '穿著指定顏色', full: '同一組別穿著顏色需相同（指定顏色為：橘色、黃色、藍色、黑色、白色或紅色其中一種）。' },
  { short: '露臉 + 完整上半身', full: '參賽者須清楚露臉、至少完整上半身得以看清楚左、右手彈奏姿勢。' },
  { short: '自選一首中/英文曲', full: '限定參賽者自選一首中文（本土語系）、英文或演奏曲目，改編曲及原創曲均可。' },
  { short: '禁止效果器 / Loop', full: '聲音呈現，只能出現收錄當下參賽者本人歌聲、畫面中彈奏的木吉他聲。禁止人聲合音效果器、Loop 錄音循環。' },
  { short: '1~5 人，至少一把鋼弦吉他', full: '禁止對嘴代彈，如不符合以上規定將取消比賽資格。' },
  { short: '影片須維持公開', full: '參賽影片須於評審期間維持公開狀態，如因刪除或隱藏導致無法評分，視同放棄資格。' },
  { short: '每支影片對應一份表單', full: '' },
  { short: 'Ayers 主辦保有最終決策權', full: '' },
];

const EVENT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-white/10 text-white/50',
  ACTIVE: 'bg-green-500/10 text-green-500',
  ENDED: 'bg-white/10 text-white/30',
  CANCELLED: 'bg-red-500/10 text-red-500',
};

const EVENT_PAGE_TYPE_LABELS: Record<string, string> = {
  MAIN: '主頁', INFO: '簡章', REGISTER: '報名', QUIZ: '測驗', LANDING: '落地頁', OTHER: '其他',
};

const EMPTY_EVENT: Partial<EventType> = {
  title: '', slug: '', description: '', coverImage: '', location: '',
  startDate: '', endDate: '', status: 'DRAFT',
  landingUrl: '', utmSource: '', utmMedium: 'qrcode', utmCampaign: '',
  couponCode: '', discountNote: '', isActive: true, eventType: 'OTHER',
};

/** Format Date to local datetime-local input value (avoids UTC shift from toISOString) */
function toLocalDatetimeValue(val: string | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val.slice(0, 16); // already a raw string like "2026-04-07T16:00"
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Auto-generate slug: strip non-ASCII, spaces→dashes, lowercase, a-z0-9 only */
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\x00-\x7F]/g, '')   // remove non-ASCII (中文, etc.)
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    || `event-${Date.now().toString(36)}`;   // fallback if title is all Chinese
}

function EventsTab() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Partial<EventType> | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewingQr, setViewingQr] = useState<EventType | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [analyticsEvent, setAnalyticsEvent] = useState<EventType | null>(null);
  const [quizData, setQuizData] = useState<QuizAnalytics | null>(null);
  const [quizFullPage, setQuizFullPage] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [rulesEvent, setRulesEvent] = useState<EventType | null>(null);
  const [rulesItems, setRulesItems] = useState<Array<{ short: string; full: string }>>([]);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  // Registration panel
  const [regPanelEventId, setRegPanelEventId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regTotal, setRegTotal] = useState(0);
  const [regLoading, setRegLoading] = useState(false);
  const [regSettingsSaving, setRegSettingsSaving] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleToggle = async (id: string) => {
    try {
      const res = await eventService.toggleEvent(id);
      if (res.success) {
        setEvents((prev) => prev.map((e) => e.id === id ? { ...e, isActive: !e.isActive } : e));
      } else {
        alert(`切換失敗：${res.error || '未知錯誤'}`);
      }
    } catch (err: any) {
      alert(`切換失敗：${err?.response?.data?.error || err?.message || '請稍後再試'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此活動？')) return;
    try {
      const res = await eventService.deleteEvent(id);
      if (res.success) setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch { /* silent */ }
  };

  const handleSave = async () => {
    if (!editingEvent) return;
    setSaving(true);
    // Only send schema-recognized fields (strip id, referralCode, _count, timestamps, etc.)
    const payload: Record<string, unknown> = {};
    const allowedKeys = [
      'title', 'slug', 'description', 'coverImage', 'location',
      'startDate', 'endDate', 'status',
      'landingUrl', 'utmSource', 'utmMedium', 'utmCampaign',
      'couponCode', 'discountNote', 'isActive', 'eventType',
    ];
    for (const key of allowedKeys) {
      if ((editingEvent as Record<string, unknown>)[key] !== undefined) {
        payload[key] = (editingEvent as Record<string, unknown>)[key];
      }
    }
    // Ensure dates are proper ISO strings
    if (payload.startDate && typeof payload.startDate === 'string') {
      payload.startDate = new Date(payload.startDate as string).toISOString();
    }
    if (payload.endDate && typeof payload.endDate === 'string') {
      payload.endDate = new Date(payload.endDate as string).toISOString();
    }
    console.log('📤 Event save payload:', JSON.stringify(payload, null, 2));
    try {
      if (editingEvent.id) {
        const res = await eventService.updateEvent(editingEvent.id, payload);
        if (res.success) {
          setEvents((prev) => prev.map((e) => e.id === editingEvent.id ? { ...e, ...editingEvent } as EventType : e));
          setEditingEvent(null);
        } else {
          alert(`更新失敗：${res.message || res.error || JSON.stringify(res.details || res)}`);
        }
      } else {
        const res = await eventService.createEvent(payload);
        if (res.success) {
          setEditingEvent(null);
          fetchEvents();
        } else {
          alert(`新增失敗：${res.message || res.error || JSON.stringify(res.details || res)}`);
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || '未知錯誤';
      const details = err?.response?.data?.details;
      console.error('Event save error:', err?.response?.data || err);
      alert(`儲存失敗：${msg}${details ? '\n' + (Array.isArray(details) ? details.join('\n') : JSON.stringify(details)) : ''}`);
    } finally { setSaving(false); }
  };

  const handleViewAnalytics = async (event: EventType) => {
    // Soul Guitar quiz event → show full quiz analytics panel
    if (event.slug.startsWith('soul-guitar')) {
      setQuizFullPage(true);
      setQuizData(null);
      try {
        const data = await quizService.getAnalytics();
        setQuizData(data);
      } catch { /* silent */ }
      return;
    }
    setAnalyticsEvent(event);
    setAnalytics(null);
    try {
      const data = await eventService.getEventAnalytics(event.id);
      setAnalytics(data);
    } catch { /* silent */ }
  };

  const handleCopyLink = async (event: EventType) => {
    const url = `${window.location.origin}/e/${event.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas || !viewingQr) return;
    const link = document.createElement('a');
    link.download = `${viewingQr.slug}-qrcode.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleOpenRules = (event: EventType) => {
    setRulesEvent(event);
    const saved = event.metadata?.rules;
    if (Array.isArray(saved) && saved.length > 0) {
      setRulesItems([...saved]);
    } else if (event.slug === 'soul-guitar/info') {
      setRulesItems([...SOUL_GUITAR_INFO_DEFAULT_RULES]);
    } else {
      setRulesItems([]);
    }
  };

  const handleSaveRules = async () => {
    if (!rulesEvent) return;
    setRulesSaving(true);
    try {
      const res = await eventService.updateEvent(rulesEvent.id, { metadata: { rules: rulesItems } } as any);
      if (res.success) {
        setEvents((prev) => prev.map((e) => e.id === rulesEvent.id ? { ...e, metadata: { rules: rulesItems } } : e));
        setRulesEvent(null);
      } else {
        alert(`儲存失敗：${res.error || '未知錯誤'}`);
      }
    } catch { alert('儲存失敗'); } finally { setRulesSaving(false); }
  };

  const handleMoveRule = (idx: number, dir: -1 | 1) => {
    setRulesItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('zh-TW') : '—';

  const handleOpenRegPanel = async (eventId: string) => {
    setRegPanelEventId(eventId);
    setRegLoading(true);
    setRegistrations([]);
    try {
      const { registrations: regs, total } = await registrationService.list(eventId);
      setRegistrations(regs);
      setRegTotal(total);
    } catch { /* silent */ } finally { setRegLoading(false); }
  };

  const handleDeleteReg = async (id: string) => {
    if (!window.confirm('確定要刪除這筆報名嗎？')) return;
    try {
      await registrationService.deleteOne(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      setRegTotal((n) => n - 1);
    } catch { alert('刪除失敗'); }
  };

  const handleRegSettings = async (eventId: string, open: boolean, limit: number) => {
    setRegSettingsSaving(true);
    try {
      const res = await registrationService.updateSettings(eventId, { registrationOpen: open, registrationLimit: limit });
      if (res.success) {
        setEvents((prev) => prev.map((e) => e.id === eventId
          ? { ...e, registrationOpen: open, registrationLimit: limit }
          : e));
      }
    } catch { alert('設定儲存失敗'); } finally { setRegSettingsSaving(false); }
  };

  if (quizFullPage) {
    return (
      <QuizFullPage
        data={quizData}
        onBack={() => setQuizFullPage(false)}
        onRefresh={async () => {
          setQuizData(null);
          try { setQuizData(await quizService.getAnalytics()); } catch { /* silent */ }
        }}
      />
    );
  }

  const renderEventRow = (event: EventType, sub = false) => (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-bold truncate cursor-pointer hover:text-ayers-gold transition-colors"
            onClick={() => window.open(`/e/${event.slug}`, '_blank')}
          >{event.title}</h3>
          {sub && event.slug.includes('/') && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-white/5 text-white/25">
              /{event.slug.split('/').slice(1).join('/')}
            </span>
          )}
          <span className={cn('shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest', EVENT_STATUS_COLORS[event.status])}>
            {event.status}
          </span>
          {event.eventType && event.eventType !== 'OTHER' && (
            <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 font-bold">
              {EVENT_PAGE_TYPE_LABELS[event.eventType]}
            </span>
          )}
          {!event.isActive && <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold">隱藏</span>}
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><CalendarDays size={10} /> {fmtDate(event.startDate)} — {fmtDate(event.endDate)}</span>
          {event.location && <span className="flex items-center gap-1"><MapPin size={10} /> {event.location}</span>}
          <span className="flex items-center gap-1"><QrCode size={10} /> 掃描 {event.totalScans} 次</span>
          {event.couponCode && <span className="flex items-center gap-1"><Ticket size={10} /> {event.couponCode}</span>}
          {event.slug.includes('register') && (
            <span className={cn('flex items-center gap-1', event.registrationOpen ? 'text-green-400' : 'text-white/25')}>
              <Users size={10} /> {event.registrationOpen ? `開放報名` : '報名關閉'}
              {event.registrationLimit > 0 && ` · 上限 ${event.registrationLimit}`}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => window.open(`/e/${event.slug}`, '_blank')} title="開啟活動頁面"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all">
          <ExternalLink size={14} />
        </button>
        {event.eventType === 'REGISTER' && (
          <button onClick={() => handleOpenRegPanel(event.id)} title="報名管理"
            className={cn('p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all',
              regPanelEventId === event.id ? 'text-ayers-gold' : 'text-white/40 hover:text-ayers-gold')}>
            <Users size={14} />
          </button>
        )}
        {event.eventType === 'INFO' && (
          <button onClick={() => handleOpenRules(event)} title="編輯比賽規則"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all">
            <FileText size={14} />
          </button>
        )}
        <button onClick={() => setViewingQr(event)} title="QR Code"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all">
          <QrCode size={14} />
        </button>
        <button onClick={() => handleCopyLink(event)} title="複製連結"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all">
          {copiedId === event.id ? <Check size={14} className="text-green-400" /> : <Link size={14} />}
        </button>
        <button onClick={() => handleViewAnalytics(event)} title="數據分析"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all">
          <BarChart3 size={14} />
        </button>
        <button onClick={() => handleToggle(event.id)} title={event.isActive ? '點擊隱藏' : '點擊顯示'}
          className={cn('p-2 rounded-lg transition-all', event.isActive
            ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'
            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20')}>
          {event.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={() => { setEditingEvent({ ...event }); setShowAdvanced(true); setSlugManuallyEdited(true); }} title="編輯"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all">
          <Edit size={14} />
        </button>
        <button onClick={() => handleDelete(event.id)} title="刪除"
          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.events.title', '活動管理')}</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchEvents} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
          <button
            onClick={() => { setEditingEvent({ ...EMPTY_EVENT }); setShowAdvanced(false); setSlugManuallyEdited(false); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all"
          >
            <Plus size={12} /> {t('admin.events.addEvent', '新增活動')}
          </button>
        </div>
      </div>

      {/* ── Registration Panel ── */}
      {regPanelEventId && (() => {
        const regEvent = events.find(e => e.id === regPanelEventId);
        if (!regEvent) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setRegPanelEventId(null)}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-t-2xl sm:rounded-2xl w-full max-w-4xl mx-0 sm:mx-4 flex flex-col"
              style={{ background: CARD_BG, maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold">報名管理</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">{regEvent.title} · 共 {regTotal} 筆</p>
                </div>
                <button onClick={() => setRegPanelEventId(null)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors"><X size={16} /></button>
              </div>

              {/* Settings bar */}
              <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/50">報名狀態</span>
                  <button
                    onClick={() => handleRegSettings(regEvent.id, !regEvent.registrationOpen, regEvent.registrationLimit)}
                    disabled={regSettingsSaving}
                    className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                      regEvent.registrationOpen ? 'bg-green-500' : 'bg-white/10')}
                  >
                    <span className={cn('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                      regEvent.registrationOpen ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                  <span className={cn('text-xs font-bold', regEvent.registrationOpen ? 'text-green-400' : 'text-white/30')}>
                    {regEvent.registrationOpen ? '開放中' : '已關閉'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">上限</span>
                  <input
                    type="number" min={0} max={10000}
                    defaultValue={regEvent.registrationLimit}
                    onBlur={e => handleRegSettings(regEvent.id, regEvent.registrationOpen, Number(e.target.value))}
                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-ayers-gold/40 text-center"
                  />
                  <span className="text-[10px] text-white/25">（0 = 無限制）</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-white/30">{regTotal} / {regEvent.registrationLimit > 0 ? regEvent.registrationLimit : '∞'}</span>
                  <a
                    href={`${registrationService.exportUrl(regEvent.id)}?token=${localStorage.getItem('token') || ''}`}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-white/60 hover:text-white transition-all"
                  >
                    <Download size={12} /> 匯出 CSV
                  </a>
                </div>
              </div>

              {/* Registration list */}
              <div className="overflow-y-auto flex-1">
                {regLoading ? (
                  <div className="py-12 flex justify-center"><Spinner /></div>
                ) : registrations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-white/25 uppercase tracking-widest">尚無報名資料</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0" style={{ background: CARD_BG }}>
                      <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                        <th className="px-4 py-3 text-left font-medium">#</th>
                        <th className="px-4 py-3 text-left font-medium">姓名</th>
                        <th className="px-4 py-3 text-left font-medium">Email</th>
                        <th className="px-4 py-3 text-left font-medium">手機</th>
                        <th className="px-4 py-3 text-left font-medium">組別</th>
                        <th className="px-4 py-3 text-left font-medium">顏色</th>
                        <th className="px-4 py-3 text-left font-medium">YouTube</th>
                        <th className="px-4 py-3 text-left font-medium">報名時間</th>
                        <th className="px-4 py-3 text-left font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {registrations.map((r, i) => (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-3 text-white/25">{i + 1}</td>
                          <td className="px-4 py-3">
                            <p className="text-white/80 font-medium">{r.name}</p>
                            {r.stageName && <p className="text-white/30 text-[10px]">{r.stageName}</p>}
                          </td>
                          <td className="px-4 py-3 text-white/50">{r.email}</td>
                          <td className="px-4 py-3 text-white/50">{r.phone}</td>
                          <td className="px-4 py-3">
                            <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold',
                              r.category === '彈唱組' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400')}>
                              {r.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/50">{r.soulColor}</td>
                          <td className="px-4 py-3">
                            <a href={r.youtube} target="_blank" rel="noreferrer"
                              className="text-ayers-gold/60 hover:text-ayers-gold truncate block max-w-[120px] transition-colors">
                              {r.youtube.replace('https://', '').slice(0, 28)}…
                            </a>
                          </td>
                          <td className="px-4 py-3 text-white/30 whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDeleteReg(r.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ── Rules Editor Modal ── */}
      {rulesEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRulesEvent(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]" style={{ background: CARD_BG }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold">比賽規則編輯</h3>
                <p className="text-[10px] text-white/30 mt-0.5">{rulesEvent.title}</p>
              </div>
              <button onClick={() => setRulesEvent(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
            </div>

            {/* Rules List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {rulesItems.length === 0 && (
                <p className="text-center text-white/20 text-xs py-8">尚無規則，點擊下方「新增規則」開始</p>
              )}
              {rulesItems.map((rule, idx) => (
                <div key={idx} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-ayers-gold/10 text-ayers-gold text-[9px] font-bold flex items-center justify-center mt-1">{idx + 1}</span>
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        value={rule.short}
                        onChange={(e) => setRulesItems((prev) => prev.map((r, i) => i === idx ? { ...r, short: e.target.value } : r))}
                        placeholder="規則標題（粗體）"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-ayers-gold transition-all"
                      />
                      <input
                        value={rule.full}
                        onChange={(e) => setRulesItems((prev) => prev.map((r, i) => i === idx ? { ...r, full: e.target.value } : r))}
                        placeholder="規則說明（選填，灰色補充文字）"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50 focus:outline-none focus:border-ayers-gold transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" title="上移" onClick={() => handleMoveRule(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronUp size={12} /></button>
                      <button type="button" title="下移" onClick={() => handleMoveRule(idx, 1)} disabled={idx === rulesItems.length - 1} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} /></button>
                      <button type="button" title="刪除" onClick={() => setRulesItems((prev) => prev.filter((_, i) => i !== idx))} className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Rule */}
              <button
                onClick={() => setRulesItems((prev) => [...prev, { short: '', full: '' }])}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white hover:border-white/20 text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus size={12} /> 新增規則
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0">
              <p className="text-[10px] text-white/20">共 {rulesItems.length} 條規則</p>
              <div className="flex gap-3">
                <button onClick={() => setRulesEvent(null)} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">取消</button>
                <button onClick={handleSaveRules} disabled={rulesSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 disabled:opacity-40 transition-all">
                  <Save size={12} /> {rulesSaving ? '儲存中...' : '儲存規則'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── QR Code Modal ── */}
      {viewingQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewingQr(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 max-w-md w-full mx-4 text-center" style={{ background: CARD_BG }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold mb-2">{viewingQr.title}</h3>
            <p className="text-[10px] text-white/40 mb-6">推薦碼：{viewingQr.referralCode}</p>
            <div ref={qrRef} className="inline-block p-4 bg-white rounded-xl mb-4">
              <QRCode
                value={`${window.location.origin}/e/${viewingQr.slug}`}
                size={220}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
                qrStyle="dots"
                eyeRadius={8}
                ecLevel="H"
                logoImage="/images/ayers-logo.svg"
                logoWidth={60}
                logoHeight={33}
                logoOpacity={1}
                logoPadding={2}
                logoPaddingStyle="circle"
                removeQrCodeBehindLogo
              />
            </div>
            <p className="text-[10px] text-white/30 mb-4 break-all font-mono">
              {`${window.location.origin}/e/${viewingQr.slug}`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDownloadQr}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                <Download size={12} /> 下載 PNG
              </button>
              <button
                onClick={() => handleCopyLink(viewingQr)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all"
              >
                {copiedId === viewingQr.id ? <><Check size={12} /> 已複製</> : <><Copy size={12} /> 複製連結</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Analytics Modal ── */}
      {analyticsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAnalyticsEvent(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 max-w-lg w-full mx-4" style={{ background: CARD_BG }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold">{analyticsEvent.title} — 數據分析</h3>
              <button onClick={() => setAnalyticsEvent(null)} className="text-white/30 hover:text-white"><X size={14} /></button>
            </div>
            {!analytics ? (
              <div className="py-10 text-center"><GuitarSunLoader size={24} /></div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl p-4 bg-white/5 text-center">
                    <p className="text-2xl font-bold text-ayers-gold">{analytics.totalScans}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">掃描次數</p>
                  </div>
                  <div className="rounded-xl p-4 bg-white/5 text-center">
                    <p className="text-2xl font-bold text-ayers-gold">{analytics.totalClicks}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">點擊次數</p>
                  </div>
                  <div className="rounded-xl p-4 bg-white/5 text-center">
                    <p className="text-2xl font-bold text-ayers-gold">{analytics.uniqueVisitors}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">不重複訪客</p>
                  </div>
                </div>
                {analytics.deviceBreakdown.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">裝置分佈</h4>
                    <div className="flex gap-3">
                      {analytics.deviceBreakdown.map((d) => (
                        <div key={d.device} className="flex-1 rounded-xl p-3 bg-white/5 text-center">
                          <p className="text-lg font-bold">{d.count}</p>
                          <p className="text-[10px] text-white/40 capitalize">{d.device}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {analytics.dailyClicks.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">每日點擊</h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={analytics.dailyClicks}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} />
                        <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} />
                        <Tooltip contentStyle={{ background: '#1e160d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }} />
                        <Bar dataKey="count" fill="#c5a059" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Edit / Create Form ── */}
      {editingEvent && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card title={editingEvent.id ? '編輯活動' : '新增活動'} action={
            <button onClick={() => setEditingEvent(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
          }>
            <div className="p-5 space-y-6">

              {/* ── 基本模式：必填欄位 ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-white/40 mb-1.5">活動名稱 <span className="text-red-400">*</span></label>
                  <input type="text" value={editingEvent.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const autoSlug = !slugManuallyEdited ? toSlug(title) : editingEvent.slug;
                      const autoUtmCampaign = !showAdvanced ? toSlug(title) : editingEvent.utmCampaign;
                      setEditingEvent(p => p ? { ...p, title, slug: autoSlug, utmCampaign: autoUtmCampaign } : p);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="例：2026 春季吉他展" />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">開始日期 <span className="text-red-400">*</span></label>
                  <input type="datetime-local" value={toLocalDatetimeValue(editingEvent.startDate)} onChange={(e) => setEditingEvent(p => p ? { ...p, startDate: e.target.value } : p)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">結束日期 <span className="text-red-400">*</span></label>
                  <input type="datetime-local" value={toLocalDatetimeValue(editingEvent.endDate)} onChange={(e) => setEditingEvent(p => p ? { ...p, endDate: e.target.value } : p)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-white/40 mb-1.5">活動描述 <span className="text-red-400">*</span></label>
                  <textarea value={editingEvent.description || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, description: e.target.value } : p)} rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all resize-none" placeholder="簡述活動內容..." />
                </div>
              </div>

              {/* Auto-filled hint */}
              {!showAdvanced && (editingEvent.slug || editingEvent.utmCampaign) && (
                <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
                  <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">自動產生</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-white/40">
                    {editingEvent.slug && <span>Slug：<span className="font-mono text-white/60">{editingEvent.slug}</span></span>}
                    <span>UTM Medium：<span className="font-mono text-white/60">qrcode</span></span>
                    {editingEvent.utmCampaign && <span>UTM Campaign：<span className="font-mono text-white/60">{editingEvent.utmCampaign}</span></span>}
                    <span>狀態：<span className="text-white/60">草稿</span></span>
                  </div>
                </div>
              )}

              {/* ── 進階選項展開按鈕 ── */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
              >
                <ChevronDown size={12} className={cn('transition-transform', showAdvanced && 'rotate-180')} />
                {showAdvanced ? '收起進階選項' : '展開進階選項（Slug、圖片、地點、UTM、優惠券⋯）'}
              </button>

              {/* ── 進階選項 ── */}
              {showAdvanced && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 overflow-hidden">

                  {/* Slug, Status, Location, Cover */}
                  <div>
                    <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">詳細設定</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">Slug（網址識別碼）</label>
                        <input type="text" value={editingEvent.slug || ''}
                          onChange={(e) => { setSlugManuallyEdited(true); setEditingEvent(p => p ? { ...p, slug: e.target.value } : p); }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all font-mono" placeholder="自動由名稱產生" />
                        <p className="text-[9px] text-white/20 mt-1">留空或不修改將由活動名稱自動產生</p>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">狀態</label>
                        <select value={editingEvent.status || 'DRAFT'} onChange={(e) => setEditingEvent(p => p ? { ...p, status: e.target.value as EventType['status'] } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all">
                          <option value="DRAFT" className="bg-[#1e160d]">草稿</option>
                          <option value="ACTIVE" className="bg-[#1e160d]">啟用</option>
                          <option value="ENDED" className="bg-[#1e160d]">已結束</option>
                          <option value="CANCELLED" className="bg-[#1e160d]">已取消</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">頁面類型</label>
                        <select value={editingEvent.eventType || 'OTHER'} onChange={(e) => setEditingEvent(p => p ? { ...p, eventType: e.target.value as EventType['eventType'] } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all">
                          {Object.entries(EVENT_PAGE_TYPE_LABELS).map(([val, label]) => (
                            <option key={val} value={val} className="bg-[#1e160d]">{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">活動地點</label>
                        <input type="text" value={editingEvent.location || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, location: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="例：台北世貿中心" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">封面圖片 URL</label>
                        <input type="text" value={editingEvent.coverImage || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, coverImage: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  {/* QR Code & UTM */}
                  <div>
                    <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">QR Code 與引流設定</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">自訂導向網址</label>
                        <input type="text" value={editingEvent.landingUrl || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, landingUrl: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="留空則導向活動頁面" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">UTM Source</label>
                        <input type="text" value={editingEvent.utmSource || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, utmSource: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="例：flyer, poster, social" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">UTM Medium</label>
                        <input type="text" value={editingEvent.utmMedium || 'qrcode'} onChange={(e) => setEditingEvent(p => p ? { ...p, utmMedium: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="預設：qrcode" />
                        <p className="text-[9px] text-white/20 mt-1">預設為 qrcode</p>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">UTM Campaign</label>
                        <input type="text" value={editingEvent.utmCampaign || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, utmCampaign: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="自動由名稱產生" />
                        <p className="text-[9px] text-white/20 mt-1">留空將由活動名稱自動產生</p>
                      </div>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div>
                    <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">優惠券關聯</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">優惠碼</label>
                        <input type="text" value={editingEvent.couponCode || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, couponCode: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all font-mono" placeholder="例：SPRING2026" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">優惠說明</label>
                        <input type="text" value={editingEvent.discountNote || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, discountNote: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="例：全館 9 折優惠" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setEditingEvent(null); setShowAdvanced(false); setSlugManuallyEdited(false); }} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">取消</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 disabled:opacity-40 transition-all">
                  <Save size={12} /> {saving ? '儲存中...' : '儲存'}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Events List ── */}
      {loading ? <Spinner /> : events.length === 0 ? (
        <div className="py-16 text-center">
          <CalendarDays size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-xs text-white/30 uppercase tracking-widest">尚無活動</p>
        </div>
      ) : (() => {
        // Group by first slug segment (e.g. "soul-guitar/info" → key "soul-guitar")
        const groupMap = new Map<string, EventType[]>();
        for (const e of events) {
          const key = e.slug.split('/')[0];
          if (!groupMap.has(key)) groupMap.set(key, []);
          groupMap.get(key)!.push(e);
        }
        return (
          <div className="space-y-4">
            {[...groupMap.entries()].map(([parentKey, groupEvents]) => {
              // Single event — render as plain card (no grouping chrome)
              if (groupEvents.length === 1) {
                const event = groupEvents[0];
                return (
                  <Card key={event.id}>
                    <div className="p-5">{renderEventRow(event)}</div>
                  </Card>
                );
              }
              // Multiple sub-pages — render as collapsible group
              const isCollapsed = collapsedGroups.has(parentKey);
              const totalScans = groupEvents.reduce((s, e) => s + (e.totalScans || 0), 0);
              const mainEvent = groupEvents.find(e => e.slug === parentKey);
              const groupLabel = mainEvent?.title ?? parentKey;
              return (
                <div key={parentKey} className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: CARD_BG }}>
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => setCollapsedGroups(prev => {
                      const next = new Set(prev);
                      next.has(parentKey) ? next.delete(parentKey) : next.add(parentKey);
                      return next;
                    })}
                    className="w-full flex items-center justify-between px-5 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed
                        ? <ChevronRight size={13} className="text-white/30" />
                        : <ChevronDown size={13} className="text-white/30" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{groupLabel}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/25">{groupEvents.length} 頁</span>
                    </div>
                    <span className="text-[10px] text-white/25 flex items-center gap-1">
                      <QrCode size={10} /> 共掃描 {totalScans} 次
                    </span>
                  </button>
                  {/* Sub-event rows */}
                  {!isCollapsed && (
                    <div className="divide-y divide-white/[0.04]">
                      {groupEvents.map(event => (
                        <div key={event.id} className="px-5 py-4">
                          {renderEventRow(event, true)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════ */

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: CARD_BG }}>
      {title && (
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/35">{title}</h3>
          {action}
        </div>
      )}
      <div className={title ? '' : ''}>{children}</div>
    </div>
  );
}

function OrderTable({ orders, loading, compact, updating, onStatusChange }: {
  orders: Order[]; loading: boolean; compact?: boolean;
  updating?: string | null; onStatusChange?: (id: string, status: string) => void;
}) {
  const { t } = useTranslation();
  if (loading) return <Spinner />;
  if (!orders.length) return (
    <div className="py-16 text-center">
      <ShoppingBag size={40} className="mx-auto text-white/10 mb-3" />
      <p className="text-xs text-white/30 uppercase tracking-widest">{t('admin.orders.noOrders')}</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
            <th className="px-5 py-4">{t('admin.orders.order')}</th>
            <th className="px-5 py-4">{t('admin.orders.date')}</th>
            <th className="px-5 py-4">{t('admin.orders.customer')}</th>
            <th className="px-5 py-4">{t('admin.orders.total')}</th>
            <th className="px-5 py-4">{t('admin.orders.status')}</th>
            {!compact && <th className="px-5 py-4">{t('admin.orders.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-4 font-mono text-ayers-gold text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
              <td className="px-5 py-4 text-white/50 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-4 text-xs">{o.user ? `${o.user.firstName} ${o.user.lastName}` : '—'}</td>
              <td className="px-5 py-4 font-mono">${Number(o.totalAmount).toFixed(2)}</td>
              <td className="px-5 py-4">
                {onStatusChange ? (
                  <select
                    value={o.status}
                    onChange={(e) => onStatusChange(o.id, e.target.value)}
                    disabled={updating === o.id}
                    className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border-none cursor-pointer focus:outline-none', STATUS_COLORS[o.status] || 'bg-white/5 text-white/40', updating === o.id && 'opacity-40')}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s} className="bg-[#1e160d] text-white">{t(STATUS_LABEL_KEYS[s])}</option>)}
                  </select>
                ) : (
                  <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest', STATUS_COLORS[o.status])}>{t(STATUS_LABEL_KEYS[o.status])}</span>
                )}
              </td>
              {!compact && (
                <td className="px-5 py-4">
                  <button className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-ayers-gold transition-colors flex items-center gap-1">{t('admin.orders.view')} <ChevronRight size={10} /></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center py-16"><GuitarSunLoader size={24} /></div>;
}

function EmptyChart({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="h-56 flex flex-col items-center justify-center">
      <div className="text-white/8 mb-3">{icon}</div>
      <p className="text-[10px] uppercase tracking-widest text-white/25">{message}</p>
    </div>
  );
}

function AdminLoader() {
  return <FullPageLoader bgStyle={ESPRESSO_DARK} />;
}

/* ═══════════════════════════════════════════════════════
   QUIZ ANALYTICS TAB
══════════════════════════════════════════════════════════ */

const RESULT_COLORS: Record<string, string> = {
  fire:         '#E04040',
  fireworks:    '#FF8C42',
  sun:          '#F5C842',
  glow:         '#A8D060',
  wave:         '#40C0E0',
  'deep-sea':   '#3060B0',
  moon:         '#9080C0',
  'dream-moon': '#C080A0',
};

const RESULT_EMOJI: Record<string, string> = {
  fire: '🔥', fireworks: '✨', sun: '☀️', glow: '🌟',
  wave: '🌊', 'deep-sea': '🫧', moon: '🌙', 'dream-moon': '🌙',
};

/* ── Quiz character meta (used only in analytics) ── */
const QUIZ_CHAR_META: Record<string, { soul: string; dim: string; tag: string; city: string; music: string; compatible: string }> = {
  fire:         { soul: 'FIRE', dim: '自由', tag: '帶著能量的人',       city: '台中',   music: 'Rock / Blues / Rhythm Guitar',   compatible: '月光' },
  fireworks:    { soul: 'FIRE', dim: '故事', tag: '帶著火花的創作者',   city: '高雄',   music: 'Fingerstyle / Jazz / R&B',         compatible: '深海' },
  sun:          { soul: 'SUN',  dim: '自由', tag: '溫暖又有行動力的人', city: '台南',   music: 'Acoustic Pop / Bossa Nova',        compatible: '微光' },
  glow:         { soul: 'SUN',  dim: '故事', tag: '細膩又善解人意的人', city: '桃園',   music: 'Indie Folk / Soft Rock',           compatible: '太陽' },
  wave:         { soul: 'WAVE', dim: '自由', tag: '自由奔放的靈魂',     city: '宜蘭',   music: 'Surf / World / Reggae',            compatible: '深海' },
  'deep-sea':   { soul: 'WAVE', dim: '故事', tag: '深沉神秘的觀察者',   city: '基隆',   music: 'Post-Rock / Ambient / Jazz',       compatible: '海浪' },
  moon:         { soul: 'MOON', dim: '故事', tag: '浪漫感性的思考者',   city: '新竹',   music: 'Neo Soul / Ballad / Classical',    compatible: '火焰' },
  'dream-moon': { soul: 'MOON', dim: '自由', tag: '夢幻創意的想像家',   city: '花蓮',   music: 'Dream Pop / Shoegaze / Lo-fi',     compatible: '煙火' },
};

const SOUL_GROUP: Record<string, { label: string; emoji: string; color: string; slugs: string[] }> = {
  FIRE:  { label: '火焰系',   emoji: '🔥', color: '#E04040', slugs: ['fire', 'fireworks'] },
  SUN:   { label: '太陽系',   emoji: '☀️', color: '#F5C842', slugs: ['sun', 'glow'] },
  WAVE:  { label: '海浪系',   emoji: '🌊', color: '#40C0E0', slugs: ['wave', 'deep-sea'] },
  MOON:  { label: '月光系',   emoji: '🌙', color: '#9080C0', slugs: ['moon', 'dream-moon'] },
};

function QuizFullPage({ data, onBack, onRefresh }: {
  data: QuizAnalytics | null;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = async () => {
    setClearing(true);
    try {
      await quizService.clearAll();
      setConfirmClear(false);
      onRefresh();
    } catch { /* silent */ } finally { setClearing(false); }
  };
  const total = data?.total ?? 0;

  // Soul group counts
  const soulCounts = data ? Object.entries(SOUL_GROUP).map(([key, g]) => ({
    ...g, key,
    count: g.slugs.reduce((s, sl) => s + (data.byResult.find(r => r.slug === sl)?.count ?? 0), 0),
  })) : [];

  // Dimension counts
  const freeCount  = data ? ['fire','sun','wave','dream-moon'].reduce((s, sl) => s + (data.byResult.find(r => r.slug === sl)?.count ?? 0), 0) : 0;
  const storyCount = data ? ['fireworks','glow','deep-sea','moon'].reduce((s, sl) => s + (data.byResult.find(r => r.slug === sl)?.count ?? 0), 0) : 0;

  const dailyAvg = data && data.daily.length > 0
    ? (total / data.daily.length).toFixed(1)
    : '—';

  const tooltipStyle = { background: CARD_BG, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs">
            <ChevronLeft size={14} /> 活動管理
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div>
            <h2 className="text-xl font-bold text-ayers-gold tracking-wide">🎸 吉他靈魂測驗 — 數據分析</h2>
            <p className="text-[11px] text-white/30 mt-0.5">統計所有測驗完成結果 · 共 8 種角色</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onRefresh} className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-xs">
            <RefreshCw size={13} /> 重新整理
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
          >
            <Trash2 size={12} /> 清空測試資料
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmClear(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-7 max-w-sm w-full mx-4 border border-red-500/20"
            style={{ background: CARD_BG }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">確認清空所有測驗資料？</p>
                <p className="text-xs text-white/40 mt-0.5">共 {data?.total ?? 0} 筆紀錄將永久刪除，無法復原</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClear(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
                取消
              </button>
              <button
                onClick={handleClear}
                disabled={clearing}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-500/80 hover:bg-red-500 disabled:opacity-50 transition-all"
              >
                {clearing ? '刪除中⋯' : '確認刪除'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {!data ? (
        <div className="py-32 text-center"><GuitarSunLoader size={28} /></div>
      ) : (
        <>
          {/* ── KPI row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard title="總完成次數" value={total.toString()} />
            <StatCard
              title="最熱門角色"
              value={data.byResult[0] ? RESULT_EMOJI[data.byResult[0].slug] + ' ' + data.byResult[0].label.split(' ')[0] : '—'}
              sub={data.byResult[0] ? `${data.byResult[0].count} 次 (${total > 0 ? ((data.byResult[0].count/total)*100).toFixed(1) : 0}%)` : ''}
            />
            <StatCard title="每日平均" value={dailyAvg === '—' ? '—' : `${dailyAvg} 次`} sub="近 30 天" />
            <StatCard
              title="手機用戶"
              value={`${Math.round(((data.byDevice.find(d => d.device === 'mobile')?.count ?? 0) / Math.max(total, 1)) * 100)}%`}
            />
            <StatCard
              title="電腦用戶"
              value={`${Math.round(((data.byDevice.find(d => d.device === 'desktop')?.count ?? 0) / Math.max(total, 1)) * 100)}%`}
            />
          </div>

          {/* ── Soul type groups ── */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">靈魂類型分布</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {soulCounts.map((g) => {
                const pct = total > 0 ? (g.count / total) * 100 : 0;
                return (
                  <div key={g.key} className="rounded-2xl p-5 border border-white/5 relative overflow-hidden" style={{ background: CARD_BG }}>
                    <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ background: `radial-gradient(circle at top right, ${g.color}, transparent 70%)` }} />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{g.emoji}</span>
                        <span className="text-xs font-bold" style={{ color: g.color }}>{pct.toFixed(1)}%</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{g.count}</p>
                      <p className="text-xs text-white/40 mt-1">{g.label}</p>
                      <div className="mt-3 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Dimension: 自由 vs 故事 ── */}
          <Card title="維度分析 — 自由型 vs 故事型">
            <div className="p-5 space-y-4">
              {[
                { label: '🌊 自由型', count: freeCount, color: '#40C0E0', desc: '跟著感覺走、行動派' },
                { label: '📖 故事型', count: storyCount, color: '#C080A0', desc: '有情感深度、記憶驅動' },
              ].map((d) => {
                const pct = total > 0 ? (d.count / total) * 100 : 0;
                return (
                  <div key={d.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-white/70">{d.label} <span className="text-white/30 text-xs">· {d.desc}</span></span>
                      <span className="text-xs text-white/50">{d.count} 人 ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="bg-white/5 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── All 8 results ranking ── */}
          <Card title="8 種角色完整排行">
            <div className="divide-y divide-white/5">
              {data.byResult.length === 0 ? (
                <EmptyChart icon={<BarChart3 size={40} />} message="尚無數據" />
              ) : (
                data.byResult.map((r, i) => {
                  const pct = total > 0 ? (r.count / total) * 100 : 0;
                  const meta = QUIZ_CHAR_META[r.slug];
                  return (
                    <div key={r.slug} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <span className="text-lg font-bold w-6 text-center" style={{ color: i < 3 ? '#d4a84b' : 'rgba(255,255,255,0.15)' }}>
                        {i + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0"
                        style={{ background: `${RESULT_COLORS[r.slug]}22`, border: `1.5px solid ${RESULT_COLORS[r.slug]}66` }}>
                        {RESULT_EMOJI[r.slug]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white/80">{r.label}</span>
                          {meta && <span className="text-[10px] text-white/30 truncate">· {meta.tag}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden max-w-[200px]">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: RESULT_COLORS[r.slug] || '#888' }} />
                          </div>
                          {meta && <span className="text-[10px] text-white/25 hidden sm:block">{meta.city} · {meta.music}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color: RESULT_COLORS[r.slug] }}>{r.count}</p>
                        <p className="text-[10px] text-white/30">{pct.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart */}
            <Card title="結果長條圖">
              {data.byResult.length === 0 ? (
                <EmptyChart icon={<BarChart3 size={40} />} message="尚無數據" />
              ) : (
                <div className="px-4 py-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.byResult} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="slug" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickFormatter={(v: string) => RESULT_EMOJI[v] ?? v} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#d4a84b' }} itemStyle={{ color: 'rgba(255,255,255,0.7)' }} labelFormatter={(v: string) => data.byResult.find(r => r.slug === v)?.label ?? v} />
                      <Bar dataKey="count" name="完成人數" radius={[4, 4, 0, 0]}>
                        {data.byResult.map((r) => <Cell key={r.slug} fill={RESULT_COLORS[r.slug] || '#d4a84b'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Device breakdown */}
            <Card title="裝置分布">
              {data.byDevice.length === 0 ? (
                <EmptyChart icon={<BarChart3 size={40} />} message="尚無數據" />
              ) : (
                <div className="p-5 space-y-4">
                  {data.byDevice.map((d) => {
                    const pct = total > 0 ? (d.count / total) * 100 : 0;
                    const icon = d.device === 'mobile' ? '📱' : d.device === 'tablet' ? '📟' : '💻';
                    return (
                      <div key={d.device}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm text-white/70 capitalize">{icon} {d.device}</span>
                          <span className="text-xs text-white/50">{d.count} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="bg-white/5 rounded-full h-3 overflow-hidden">
                          <div className="h-full rounded-full bg-ayers-gold/60" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* ── Daily trend ── */}
          <Card title="每日完成趨勢（近 30 天）">
            {data.daily.length === 0 ? (
              <EmptyChart icon={<TrendingUp size={40} />} message="近 30 天無數據" />
            ) : (
              <div className="px-4 py-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#d4a84b' }} itemStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Bar dataKey="count" name="完成次數" fill="#d4a84b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </>
      )}
    </motion.div>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: CARD_BG }}>
      <p className="text-2xl font-bold text-ayers-gold">{value}</p>
      {sub && <p className="text-xs text-white/50 mt-0.5">{sub}</p>}
      <p className="text-[11px] text-white/35 mt-2 uppercase tracking-widest">{title}</p>
    </div>
  );
}
