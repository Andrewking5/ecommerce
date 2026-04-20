import { motion } from 'motion/react';
import { Plus, Trash2, RefreshCw, Edit, ChevronUp, ChevronDown, Eye, EyeOff, Image, X, Save, Upload } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/src/services/api';
import bannerService, { type HomeBanner } from '@/src/services/bannerService';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

function ImageUploadField({ label, hint, required, value, onChange }: {
  label: string; hint?: string; required?: boolean; value: string; onChange: (url: string) => void;
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
      const { data } = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success && data.data?.url) onChange(data.data.url);
    } catch { /* upload failed */ } finally {
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
      <div
        className={cn('relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden', value ? 'border-white/10 bg-white/5' : 'border-white/15 bg-white/[0.02] hover:border-ayers-gold/40')}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {value ? (
          <div className="relative group">
            <img src={value} alt={label} className="w-full h-32 object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white hover:bg-white/30 transition-colors">
                <Upload size={12} className="inline mr-1" />重新上傳
              </button>
              <button onClick={(e) => { e.stopPropagation(); onChange(''); }} className="px-3 py-1.5 bg-red-500/30 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white hover:bg-red-500/50 transition-colors">
                <X size={12} className="inline mr-1" />移除
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center gap-2 text-white/30">
            {uploading ? (
              <><GuitarSunLoader size={20} /><span className="text-[10px]">上傳中...</span></>
            ) : (
              <><Upload size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">點擊上傳圖片</span><span className="text-[9px] text-white/15">支援 JPG、PNG、WebP（最大 10MB）</span></>
            )}
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
      <button onClick={() => setShowUrlInput(!showUrlInput)} className="mt-1.5 text-[9px] text-white/20 hover:text-white/40 transition-colors">
        {showUrlInput ? '隱藏網址輸入' : '或手動輸入網址'}
      </button>
      {showUrlInput && (
        <input type="text" placeholder="https://... 或 /images/..." value={value} onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none focus:border-ayers-gold transition-all" />
      )}
    </div>
  );
}

const EMPTY_BANNER: Partial<HomeBanner> = {
  slug: '', placement: 'collections', subtitle: '', titleWord1: '', titleWord2: '',
  titleColor1: '#c5a059', titleColor2: '#ffffff',
  body: '', ctaLabel: '', ctaLink: '', image: '', productImage: '', gradientColor: '#1a1a1a', isActive: true,
};

export default function BannersTab() {
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
    try { await bannerService.reorderBanners(newBanners.map((b) => b.id)); } catch { /* silent */ } finally { setReordering(false); }
  };

  const handleSave = async () => {
    if (!editingBanner) return;
    setSaving(true);
    try {
      if (editingBanner.id) {
        const res = await bannerService.updateBanner(editingBanner.id, editingBanner);
        if (res.success) { setBanners((prev) => prev.map((b) => b.id === editingBanner.id ? { ...b, ...editingBanner } as HomeBanner : b)); setEditingBanner(null); }
      } else {
        const res = await bannerService.createBanner(editingBanner);
        if (res.success) { setEditingBanner(null); fetchBanners(); }
      }
    } catch { /* silent */ } finally { setSaving(false); }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.banners.title')}</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchBanners} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
          <button onClick={() => setEditingBanner({ ...EMPTY_BANNER })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all">
            <Plus size={12} /> {t('admin.banners.addBanner')}
          </button>
        </div>
      </div>

      {editingBanner && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card title={editingBanner.id ? '編輯橫幅' : '新增橫幅'} action={<button onClick={() => setEditingBanner(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>}>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">基本設定</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">顯示位置</label>
                    <select value={(editingBanner as any).placement || 'collections'} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, placement: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all">
                      <option value="home">🏠 首頁</option>
                      <option value="collections">🎸 系列頁 (Collections)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">識別碼 (Slug)</label>
                    <input type="text" placeholder="例：wave-promo" value={editingBanner.slug || ''} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">文字內容</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">標籤文字 <span className="text-white/20">(小字)</span></label>
                    <input type="text" placeholder="例：NEW ARRIVAL、限時優惠" value={editingBanner.subtitle || ''} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, subtitle: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">標題第一行 <span className="text-white/20">(大字)</span></label>
                    <input type="text" placeholder="例：Wave" value={editingBanner.titleWord1 || ''} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, titleWord1: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">標題第二行</label>
                    <input type="text" placeholder="例：濤系列" value={editingBanner.titleWord2 || ''} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, titleWord2: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-[11px] text-white/40 mb-1.5">說明文字</label>
                  <textarea placeholder="例：聲波如潮水般層疊推進，音色飽滿厚實" value={editingBanner.body || ''} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, body: e.target.value } : prev)} rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all resize-none" />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">按鈕</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">按鈕文字</label>
                    <input type="text" placeholder="例：探索 Wave 系列" value={editingBanner.ctaLabel || ''} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, ctaLabel: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 mb-1.5">按鈕連結</label>
                    <input type="text" placeholder="例：/collections?series=wave" value={editingBanner.ctaLink || ''} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, ctaLink: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">圖片</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploadField label="背景圖片" required hint="建議尺寸 1920×1080，橫式大圖" value={editingBanner.image || ''} onChange={(url) => setEditingBanner(prev => prev ? { ...prev, image: url } : prev)} />
                  <ImageUploadField label="產品圖片" hint="可選，右側浮動吉他（建議去背 PNG）" value={(editingBanner as any).productImage || ''} onChange={(url) => setEditingBanner(prev => prev ? { ...prev, productImage: url } : prev)} />
                </div>
                <div className="mt-4 max-w-xs">
                  <label className="block text-[11px] text-white/40 mb-1.5">遮罩底色 <span className="text-white/20">(文字背後的漸層色)</span></label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={(editingBanner as any).gradientColor || '#1a1a1a'} onChange={(e) => setEditingBanner(prev => prev ? { ...prev, gradientColor: e.target.value } : prev)}
                      className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                    <div className="flex gap-2">
                      {['#1a2a3a', '#2a1a0e', '#1a1a2a', '#0e1a2a', '#1a1a1a'].map(c => (
                        <button key={c} onClick={() => setEditingBanner(prev => prev ? { ...prev, gradientColor: c } : prev)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-ayers-gold transition-colors" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {(editingBanner.titleWord1 || editingBanner.image) && (
                <div>
                  <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">即時預覽</h3>
                  <div className="relative rounded-2xl overflow-hidden h-48 flex items-center" style={{ background: (editingBanner as any).gradientColor || '#1a1a1a' }}>
                    {editingBanner.image && <img src={editingBanner.image} alt={`${editingBanner.titleWord1 || ''} ${editingBanner.titleWord2 || ''}`.trim() || 'Banner'} className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${(editingBanner as any).gradientColor || '#1a1a1a'}, transparent)` }} />
                    <div className="relative z-10 p-6 max-w-sm">
                      {editingBanner.subtitle && <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-ayers-gold border border-ayers-gold/30 px-2 py-0.5 rounded-full">{editingBanner.subtitle}</span>}
                      <h3 className="text-2xl font-serif italic font-bold text-white mt-2">{editingBanner.titleWord1} {editingBanner.titleWord2}</h3>
                      {editingBanner.body && <p className="text-xs text-white/50 mt-1">{editingBanner.body}</p>}
                      {editingBanner.ctaLabel && <span className="inline-block mt-3 bg-ayers-gold text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">{editingBanner.ctaLabel}</span>}
                    </div>
                    {(editingBanner as any).productImage && <img src={(editingBanner as any).productImage} alt="Banner product" className="absolute right-4 top-2 h-44 object-contain drop-shadow-2xl" />}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditingBanner(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-white/40 text-xs font-bold hover:text-white transition-colors">取消</button>
                <button onClick={handleSave} disabled={saving || !editingBanner.slug || !editingBanner.titleWord1 || !editingBanner.image}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ayers-gold text-black text-xs font-bold hover:bg-ayers-gold/90 transition-all disabled:opacity-30">
                  {saving ? <><GuitarSunLoader size={12} /> 儲存中...</> : <><Save size={12} /> {editingBanner.id ? '更新' : '建立'}</>}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

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
                          <button onClick={() => handleMove(index, 'up')} disabled={index === 0 || reordering} className="text-white/20 hover:text-ayers-gold transition-colors disabled:opacity-20"><ChevronUp size={12} /></button>
                          <button onClick={() => handleMove(index, 'down')} disabled={index === banners.length - 1 || reordering} className="text-white/20 hover:text-ayers-gold transition-colors disabled:opacity-20"><ChevronDown size={12} /></button>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {b.image ? <img src={b.image} alt={`${b.titleWord1 || ''} ${b.titleWord2 || ''}`.trim() || 'Banner'} className="w-16 h-10 rounded-lg object-cover bg-white/5" />
                        : <div className="w-16 h-10 rounded-lg bg-white/5 flex items-center justify-center"><Image size={14} className="text-white/15" /></div>}
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ color: b.titleColor1 }}>{b.titleWord1}</span>{' '}<span style={{ color: b.titleColor2 }}>{b.titleWord2}</span>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs font-mono">{b.slug}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(b.id)} className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1', b.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                        {b.isActive ? <><Eye size={10} /> {t('admin.banners.active')}</> : <><EyeOff size={10} /> {t('admin.banners.inactive')}</>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingBanner({ ...b })} className="text-white/30 hover:text-ayers-gold transition-colors" title="Edit"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(b.id)} className="text-white/30 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
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
