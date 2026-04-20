import { motion } from 'motion/react';
import { ShoppingBag, TrendingUp, Package, AlertTriangle, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import orderService, { type Order } from '@/src/services/orderService';
import productService from '@/src/services/productService';
import { ESPRESSO, CARD_BG } from '../constants';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import EmptyChart from '../components/EmptyChart';
import OrderTable from '../components/OrderTable';

export default function DashboardTab() {
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

          const weekMap = new Map<string, number>();
          all.forEach((o) => {
            const d = new Date(o.createdAt);
            const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
            const key = ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            weekMap.set(key, (weekMap.get(key) || 0) + Number(o.totalAmount));
          });
          setSalesData(Array.from(weekMap.entries()).map(([name, sales]) => ({ name, sales: Math.round(sales) })).slice(-8));

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

      <Card title={t('admin.dashboard.recentOrders')} action={<span className="text-ayers-gold text-[10px] font-bold uppercase tracking-widest">{t('admin.dashboard.viewAll')}</span>}>
        <OrderTable orders={orders} loading={loading} compact />
      </Card>
    </>
  );
}
