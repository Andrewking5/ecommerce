import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ImageUpload from '@/components/admin/ImageUpload';
import { ProductVariant, UpdateVariantRequest } from '@/types/variant';
import { variantApi } from '@/services/variants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface VariantDetailEditorProps {
  variant: ProductVariant;
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const VariantDetailEditor: React.FC<VariantDetailEditorProps> = ({
  variant,
  productId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateVariantRequest>({
    sku: variant.sku,
    price: variant.price,
    comparePrice: variant.comparePrice ?? undefined,
    costPrice: variant.costPrice ?? undefined,
    stock: variant.stock,
    reservedStock: variant.reservedStock,
    weight: variant.weight ?? undefined,
    dimensions: variant.dimensions ?? undefined,
    barcode: variant.barcode ?? undefined,
    images: variant.images || [],
    isDefault: variant.isDefault,
    isActive: variant.isActive,
  });

  // 更新变体
  const updateMutation = useMutation({
    mutationFn: (data: UpdateVariantRequest) => variantApi.updateVariant(variant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(t('admin:variants.updateSuccess', { defaultValue: '变体更新成功' }));
      onUpdated?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || t('admin:variants.updateError', { defaultValue: '变体更新失败' }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-text-primary">
            {t('admin:variants.editVariant', { defaultValue: '编辑变体' })}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('common:close', { defaultValue: '关闭' })}
          >
            <X size={24} />
          </button>
        </div>

        {/* 内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 变体属性显示 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('admin:variants.attributes', { defaultValue: '属性' })}
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
              {variant.attributes?.map((attr) => (
                <span
                  key={attr.id}
                  className="inline-block px-3 py-1 bg-white border rounded-lg text-sm"
                >
                  <span className="font-medium">{attr.attribute?.displayName || attr.attribute?.name}:</span>{' '}
                  <span className="text-text-secondary">{attr.value}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('admin:variants.sku', { defaultValue: 'SKU' })}
              value={formData.sku || ''}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />

            <Input
              label={t('admin:variants.barcode', { defaultValue: '条形码' })}
              value={formData.barcode || ''}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('admin:variants.price', { defaultValue: '价格' })}
              type="number"
              value={formData.price ?? variant.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
            />

            <Input
              label={t('admin:variants.comparePrice', { defaultValue: '原价（用于显示折扣）' })}
              type="number"
              value={formData.comparePrice ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comparePrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              min="0"
              step="0.01"
              placeholder="可选"
            />

            <Input
              label={t('admin:variants.costPrice', { defaultValue: '成本价' })}
              type="number"
              value={formData.costPrice ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  costPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              min="0"
              step="0.01"
              placeholder="可选"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('admin:variants.stock', { defaultValue: '库存' })}
              type="number"
              value={formData.stock ?? variant.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
              min="0"
            />

            <Input
              label={t('admin:variants.reservedStock', { defaultValue: '预留库存' })}
              type="number"
              value={formData.reservedStock ?? variant.reservedStock}
              onChange={(e) => setFormData({ ...formData, reservedStock: Number(e.target.value) })}
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('admin:variants.weight', { defaultValue: '重量（kg）' })}
              type="number"
              value={formData.weight ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weight: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              min="0"
              step="0.01"
              placeholder="可选"
            />
          </div>

          {/* 变体专属图片 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('admin:variants.variantImages', { defaultValue: '变体专属图片' })}
            </label>
            <p className="text-sm text-text-secondary mb-3">
              {t('admin:variants.variantImagesHelp', {
                defaultValue: '为这个变体上传专属图片，如果不上传则使用商品主图',
              })}
            </p>
            <ImageUpload
              images={formData.images || []}
              onChange={(images) => setFormData({ ...formData, images })}
              maxImages={5}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault ?? variant.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm text-text-secondary">
                {t('admin:variants.setAsDefault', { defaultValue: '设为默认变体' })}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive ?? variant.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-text-secondary">
                {t('common:active', { defaultValue: '启用' })}
              </label>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              {t('common:cancel', { defaultValue: '取消' })}
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>
              <Save size={16} className="mr-2" />
              {t('common:save', { defaultValue: '保存' })}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VariantDetailEditor;

