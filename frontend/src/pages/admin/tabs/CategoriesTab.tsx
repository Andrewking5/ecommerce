import { motion } from 'motion/react';
import { Plus, Trash2, RefreshCw, Edit, Box, X, Save } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GuitarSunLoader } from '@/src/components/guitar';
import productService, { type Category } from '@/src/services/productService';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

export default function CategoriesTab() {
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
        if (res.success) { setCategories((prev) => prev.map((c) => c.id === editingCat.id ? { ...c, ...res.data } : c)); setEditingCat(null); }
      } else {
        const res = await productService.createCategory(editingCat);
        if (res.success) { setEditingCat(null); fetchCategories(); }
      }
    } catch (err: any) { alert(err?.response?.data?.message || 'Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.categories.deleteConfirm', '確定要刪除此分類嗎？'))) return;
    try {
      await productService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) { alert(err?.response?.data?.message || 'Delete failed'); }
  };

  const catFormField = (label: string, key: keyof Category, type: 'text' | 'textarea' = 'text') => (
    <div className={type === 'textarea' ? 'col-span-full' : ''}>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea value={(editingCat as any)?.[key] || ''} onChange={(e) => setEditingCat((prev) => prev ? { ...prev, [key]: e.target.value } : prev)} rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none" />
      ) : (
        <input type="text" value={(editingCat as any)?.[key] || ''} onChange={(e) => setEditingCat((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all" />
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.sidebar.categories', '商品分類')}</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchCategories} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
          <button onClick={() => setEditingCat({ name: '', slug: '', description: '', image: '', isActive: true })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all">
            <Plus size={12} /> {t('admin.categories.addCategory', '新增分類')}
          </button>
        </div>
      </div>

      {editingCat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !saving && setEditingCat(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
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
              <button onClick={handleSave} disabled={saving || !editingCat.name}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all disabled:opacity-50">
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
