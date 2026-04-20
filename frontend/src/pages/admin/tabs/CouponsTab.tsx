import { motion } from 'motion/react';
import { Plus, RefreshCw, Edit, Trash2, Eye, EyeOff, Ticket, X, Save } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import { GuitarSunLoader } from '@/src/components/guitar';
import couponService, { type Coupon } from '@/src/services/couponService';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

const EMPTY_COUPON: Partial<Coupon> = {
  code: '', discountType: 'percentage', discountValue: 0,
  minOrderAmount: undefined, maxUses: undefined, expiresAt: undefined, isActive: true,
};

export default function CouponsTab() {
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
        if (res.success) { setCoupons((prev) => prev.map((c) => c.id === editingCoupon.id ? { ...c, ...res.data } : c)); setEditingCoupon(null); }
      } else {
        const res = await couponService.create(payload);
        if (res.success) { setEditingCoupon(null); fetchCoupons(); }
      }
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const updateField = (key: string, value: any) => setEditingCoupon((prev) => prev ? { ...prev, [key]: value } : prev);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.coupons.title', 'Coupons')}</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchCoupons} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
          <button onClick={() => setEditingCoupon({ ...EMPTY_COUPON })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all">
            <Plus size={12} /> {t('admin.coupons.addCoupon', 'New Coupon')}
          </button>
        </div>
      </div>

      {editingCoupon && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card title={editingCoupon.id ? t('admin.coupons.editCoupon', 'Edit Coupon') : t('admin.coupons.newCoupon', 'New Coupon')}
            action={<button onClick={() => setEditingCoupon(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>}>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.code', 'Code')}</label>
                  <input type="text" value={editingCoupon.code || ''} onChange={(e) => updateField('code', e.target.value.toUpperCase())} placeholder="e.g. SUMMER20"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all uppercase tracking-wider" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.discountType', 'Discount Type')}</label>
                  <select value={editingCoupon.discountType || 'percentage'} onChange={(e) => updateField('discountType', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all">
                    <option value="percentage" className="bg-[#1e160d] text-white">{t('admin.coupons.percentage', 'Percentage (%)')}</option>
                    <option value="fixed" className="bg-[#1e160d] text-white">{t('admin.coupons.fixed', 'Fixed Amount')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.discountValue', 'Discount Value')}</label>
                  <input type="number" value={editingCoupon.discountValue || ''} onChange={(e) => updateField('discountValue', e.target.value)} placeholder={editingCoupon.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.minOrder', 'Min Order Amount')}</label>
                  <input type="number" value={editingCoupon.minOrderAmount || ''} onChange={(e) => updateField('minOrderAmount', e.target.value)} placeholder="e.g. 1000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.maxUses', 'Max Uses')}</label>
                  <input type="number" value={editingCoupon.maxUses || ''} onChange={(e) => updateField('maxUses', e.target.value)} placeholder={t('admin.coupons.unlimited', 'Unlimited')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.coupons.expiresAt', 'Expires At')}</label>
                  <input type="datetime-local" value={editingCoupon.expiresAt ? editingCoupon.expiresAt.slice(0, 16) : ''} onChange={(e) => updateField('expiresAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditingCoupon(null)} className="px-4 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">{t('admin.coupons.cancel', 'Cancel')}</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all disabled:opacity-50">
                  {saving ? <><GuitarSunLoader size={12} /> {t('admin.coupons.saving', 'Saving...')}</> : <><Save size={12} /> {editingCoupon.id ? t('admin.coupons.update', 'Update') : t('admin.coupons.create', 'Create')}</>}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

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
                        <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest', c.discountType === 'percentage' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400')}>
                          {c.discountType === 'percentage' ? t('admin.coupons.percentage', '%') : t('admin.coupons.fixed', 'Fixed')}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono">{c.discountType === 'percentage' ? `${c.discountValue}%` : `NT$ ${Number(c.discountValue).toLocaleString()}`}</td>
                      <td className="px-5 py-4 text-white/40 text-xs font-mono">{c.minOrderAmount ? `NT$ ${Number(c.minOrderAmount).toLocaleString()}` : '—'}</td>
                      <td className="px-5 py-4 text-xs"><span className="text-white/60">{c.usedCount}</span><span className="text-white/20"> / </span><span className="text-white/40">{c.maxUses || '∞'}</span></td>
                      <td className="px-5 py-4 text-white/40 text-xs">{c.expiresAt ? <span className={isExpired ? 'text-red-400' : ''}>{new Date(c.expiresAt).toLocaleDateString()}</span> : '—'}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleToggle(c)}
                          className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1', c.isActive && !isExpired ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                          {c.isActive && !isExpired ? <><Eye size={10} /> {t('admin.coupons.active', 'Active')}</> : <><EyeOff size={10} /> {isExpired ? t('admin.coupons.expired', 'Expired') : t('admin.coupons.inactive', 'Inactive')}</>}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingCoupon({ ...c })} className="text-white/30 hover:text-ayers-gold transition-colors" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(c.id)} className="text-white/30 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
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
