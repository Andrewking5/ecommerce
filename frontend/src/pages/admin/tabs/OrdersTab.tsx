import { RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import orderService, { type Order } from '@/src/services/orderService';
import Card from '../components/Card';
import OrderTable from '../components/OrderTable';

export default function OrdersTab() {
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
