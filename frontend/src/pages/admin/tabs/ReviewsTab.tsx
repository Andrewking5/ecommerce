import { RefreshCw, MessageSquare, Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import reviewService, { type Review } from '@/src/services/reviewService';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

export default function ReviewsTab() {
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
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[10px] px-3 py-2 rounded-xl font-bold uppercase tracking-widest border border-white/10 bg-transparent text-white/60 focus:outline-none focus:border-ayers-gold/40">
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
                    <td className="px-5 py-4 text-xs max-w-[160px] truncate">{r.product?.name || r.productId.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-xs text-white/70">{r.user ? `${r.user.firstName} ${r.user.lastName}` : '—'}</td>
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
                            <button onClick={() => handleApprove(r.id)} disabled={actionId === r.id} className={cn('text-green-400 hover:text-green-300 transition-colors', actionId === r.id && 'opacity-40')} title={t('admin.reviews.approve', 'Approve')}><CheckCircle size={16} /></button>
                            <button onClick={() => handleReject(r.id)} disabled={actionId === r.id} className={cn('text-red-400 hover:text-red-300 transition-colors', actionId === r.id && 'opacity-40')} title={t('admin.reviews.reject', 'Reject')}><XCircle size={16} /></button>
                          </>
                        )}
                        <button onClick={() => handleDelete(r.id)} disabled={actionId === r.id} className={cn('text-white/30 hover:text-red-400 transition-colors', actionId === r.id && 'opacity-40')} title={t('admin.reviews.delete', 'Delete')}><Trash2 size={14} /></button>
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
