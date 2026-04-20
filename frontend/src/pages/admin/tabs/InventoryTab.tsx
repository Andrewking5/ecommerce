import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import productService, { type Product } from '@/src/services/productService';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

export default function InventoryTab() {
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
      if (res.success) setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: p.stock + delta } : p));
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
                        <button onClick={() => handleAdjust(p.id, -1)} disabled={adjusting === p.id || p.stock === 0}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 text-xs font-bold">−</button>
                        <span className="w-8 text-center font-mono text-xs">{p.stock}</span>
                        <button onClick={() => handleAdjust(p.id, 1)} disabled={adjusting === p.id}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-green-500/10 hover:text-green-400 flex items-center justify-center transition-colors disabled:opacity-30 text-xs font-bold">+</button>
                        <button onClick={() => handleAdjust(p.id, 10)} disabled={adjusting === p.id}
                          className="ml-2 text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-ayers-gold/10 hover:text-ayers-gold transition-colors font-bold uppercase tracking-widest disabled:opacity-30">+10</button>
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
