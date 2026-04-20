import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import type { Order } from '@/src/services/orderService';
import { ORDER_STATUSES, STATUS_COLORS, STATUS_LABEL_KEYS } from '../constants';
import Spinner from './Spinner';

export default function OrderTable({ orders, loading, compact, updating, onStatusChange }: {
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
