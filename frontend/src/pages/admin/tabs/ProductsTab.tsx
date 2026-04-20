import { motion } from 'motion/react';
import { Plus, Trash2, RefreshCw, Edit, CheckCircle, XCircle, Upload, Download, FileSpreadsheet, X, Package, Search, Save } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import productService, { type Product, type Category } from '@/src/services/productService';
import { CARD_BG } from '../constants';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

export default function ProductsTab() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

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
        if (res.success) { setEditingProduct(null); fetchProducts(); }
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const openNewProduct = () => {
    setEditingProduct({ name: '', description: '', price: 0, stock: 0, categoryId: categories[0]?.id || '', images: [], isActive: true, specifications: {} });
  };

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
        setImportResult({ success: res.data.summary.success, failed: res.data.failed.map((f) => ({ index: f.index, error: f.error })) });
        if (res.data.summary.failed === 0) { setImportPreview([]); setShowImport(false); }
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
        <textarea value={(editingProduct as any)?.[key] || ''} onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, [key]: e.target.value } : prev)} rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none" />
      ) : (
        <input type={type} value={(editingProduct as any)?.[key] ?? ''} onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value } : prev)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all" />
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.products.title')}</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={openNewProduct} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all">
            <Plus size={12} /> {t('admin.products.addProduct', '新增商品')}
          </button>
          <button
            onClick={() => { setShowImport(!showImport); setImportPreview([]); setImportResult(null); }}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border', showImport ? 'border-ayers-gold/30 bg-ayers-gold/10 text-ayers-gold' : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/20')}
          >
            <FileSpreadsheet size={12} /> {t('admin.products.excelImport')}
          </button>
          <div className="relative">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.products.searchPlaceholder')}
              className="bg-white/5 border border-white/10 rounded-full py-2 px-8 text-xs focus:outline-none focus:border-ayers-gold transition-all w-full sm:w-48" />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={12} />
          </div>
          <button onClick={fetchProducts} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !saving && setEditingProduct(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingProduct.id ? t('admin.products.editProduct', '編輯商品') : t('admin.products.newProduct', '新增商品')}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productFormField(t('admin.products.productName', '商品名稱'), 'name')}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.products.category', '分類')}</label>
                <select value={editingProduct.categoryId || ''} onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, categoryId: e.target.value } : prev)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all">
                  <option value="" className="bg-[#1e160d]">— 選擇分類 —</option>
                  {categories.map((c) => <option key={c.id} value={c.id} className="bg-[#1e160d]">{c.name}</option>)}
                </select>
              </div>
              {productFormField(t('admin.products.price', '價格'), 'price', 'number')}
              {productFormField(t('admin.products.stock', '庫存'), 'stock', 'number')}
              {productFormField(t('admin.products.description', '描述'), 'description', 'textarea')}
              <div className="col-span-full">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.products.images', '圖片 URL')}（每行一個）</label>
                <textarea value={(editingProduct.images || []).join('\n')} onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, images: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) } : prev)}
                  rows={3} placeholder="/images/products/wave/example.png"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none font-mono" />
              </div>
              <div className="col-span-full">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{t('admin.products.specifications', '規格')}（JSON）</label>
                <textarea value={JSON.stringify(editingProduct.specifications || {}, null, 2)} onChange={(e) => { try { setEditingProduct((prev) => prev ? { ...prev, specifications: JSON.parse(e.target.value) } : prev); } catch { /* invalid JSON */ } }}
                  rows={6} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-ayers-gold transition-all resize-none font-mono" />
              </div>
            </div>
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
              <button onClick={() => setEditingProduct(null)} className="px-4 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                {t('admin.products.cancel', '取消')}
              </button>
              <button onClick={handleSaveProduct} disabled={saving || !editingProduct.name}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all disabled:opacity-50">
                {saving ? <><GuitarSunLoader size={12} /> {t('admin.products.saving', '儲存中...')}</> : <><Save size={12} /> {t('admin.products.save', '儲存')}</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showImport && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card title={t('admin.products.excelBulkImport')} action={<button onClick={() => setShowImport(false)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>}>
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
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-contain bg-white/5" />}
                        <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-xs">{p.category?.name || '—'}</td>
                    <td className="px-5 py-4 text-ayers-gold font-mono">${Number(p.price).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={cn('text-xs font-bold', p.stock <= 5 ? 'text-red-400' : p.stock <= 15 ? 'text-yellow-400' : 'text-white/60')}>{p.stock}</span>
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
