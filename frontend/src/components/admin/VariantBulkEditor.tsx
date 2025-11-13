import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Package, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ProductVariant } from '@/types/variant';
import { variantApi } from '@/services/variants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface VariantBulkEditorProps {
  productId: string;
  variants: ProductVariant[];
  selectedVariantIds: string[];
  onSelectedChange: (ids: string[]) => void;
  onUpdated?: () => void;
}

const VariantBulkEditor: React.FC<VariantBulkEditorProps> = ({
  productId,
  variants,
  selectedVariantIds,
  onSelectedChange,
  onUpdated,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkStock, setBulkStock] = useState<string>('');
  const [priceAdjustment, setPriceAdjustment] = useState<string>(''); // 价格调整（+10 或 -5 或 *1.1）
  const [adjustmentType, setAdjustmentType] = useState<'fixed' | 'percent'>('fixed');

  // 批量更新变体
  const bulkUpdateMutation = useMutation({
    mutationFn: (data: { variantIds: string[]; data: any }) => variantApi.updateVariantsBulk(data.variantIds, data.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(
        t('admin:variants.bulkUpdateSuccess', {
          count: response.count,
          defaultValue: `成功更新 ${response.count} 个变体`,
        })
      );
      onSelectedChange([]);
      setBulkPrice('');
      setBulkStock('');
      setPriceAdjustment('');
      onUpdated?.();
    },
    onError: (error: any) => {
      toast.error(error.message || t('admin:variants.bulkUpdateError', { defaultValue: '批量更新失败' }));
    },
  });

  const handleSelectAll = () => {
    if (selectedVariantIds.length === variants.length) {
      onSelectedChange([]);
    } else {
      onSelectedChange(variants.map((v) => v.id));
    }
  };

  const handleBulkPriceUpdate = () => {
    if (selectedVariantIds.length === 0) {
      toast.error(t('admin:variants.selectVariants', { defaultValue: '请先选择变体' }));
      return;
    }

    if (!bulkPrice || isNaN(Number(bulkPrice)) || Number(bulkPrice) < 0) {
      toast.error(t('admin:variants.invalidPrice', { defaultValue: '请输入有效的价格' }));
      return;
    }

    bulkUpdateMutation.mutate({
      variantIds: selectedVariantIds,
      data: { price: Number(bulkPrice) },
    });
  };

  const handleBulkStockUpdate = () => {
    if (selectedVariantIds.length === 0) {
      toast.error(t('admin:variants.selectVariants', { defaultValue: '请先选择变体' }));
      return;
    }

    if (!bulkStock || isNaN(Number(bulkStock)) || Number(bulkStock) < 0) {
      toast.error(t('admin:variants.invalidStock', { defaultValue: '请输入有效的库存' }));
      return;
    }

    bulkUpdateMutation.mutate({
      variantIds: selectedVariantIds,
      data: { stock: Number(bulkStock) },
    });
  };

  const handlePriceAdjustment = () => {
    if (selectedVariantIds.length === 0) {
      toast.error(t('admin:variants.selectVariants', { defaultValue: '请先选择变体' }));
      return;
    }

    if (!priceAdjustment || isNaN(Number(priceAdjustment))) {
      toast.error(t('admin:variants.invalidAdjustment', { defaultValue: '请输入有效的调整值' }));
      return;
    }

    // 获取选中变体的当前价格，计算新价格
    const selectedVariants = variants.filter((v) => selectedVariantIds.includes(v.id));
    const updates = selectedVariants.map((variant) => {
      let newPrice: number;
      if (adjustmentType === 'fixed') {
        newPrice = Number(variant.price) + Number(priceAdjustment);
      } else {
        // 百分比调整
        newPrice = Number(variant.price) * (1 + Number(priceAdjustment) / 100);
      }
      return { id: variant.id, price: Math.max(0, newPrice) };
    });

    // 逐个更新（因为批量更新API只支持统一值）
    Promise.all(
      updates.map((update) =>
        variantApi.updateVariant(update.id, { price: update.price })
      )
    )
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['variants', productId] });
        queryClient.invalidateQueries({ queryKey: ['products', productId] });
        toast.success(
          t('admin:variants.priceAdjustmentSuccess', {
            count: selectedVariantIds.length,
            defaultValue: `成功调整 ${selectedVariantIds.length} 个变体的价格`,
          })
        );
        onSelectedChange([]);
        setPriceAdjustment('');
        onUpdated?.();
      })
      .catch((error: any) => {
        toast.error(error.message || t('admin:variants.priceAdjustmentError', { defaultValue: '价格调整失败' }));
      });
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="text-brand-blue" size={20} />
        <h3 className="text-lg font-semibold">
          {t('admin:variants.bulkEdit', { defaultValue: '批量编辑' })}
        </h3>
        <span className="text-sm text-text-secondary ml-auto">
          {t('admin:variants.selected', {
            count: selectedVariantIds.length,
            defaultValue: `已选择 ${selectedVariantIds.length} 个变体`,
          })}
        </span>
      </div>

      {/* 选择所有 */}
      <div className="mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={handleSelectAll}
        >
          {selectedVariantIds.length === variants.length
            ? t('common:deselectAll', { defaultValue: '取消全选' })
            : t('common:selectAll', { defaultValue: '全选' })}
        </Button>
      </div>

      {/* 批量操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 批量设置价格 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary flex items-center gap-2">
            <DollarSign size={16} />
            {t('admin:variants.bulkSetPrice', { defaultValue: '批量设置价格' })}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="flex-1"
            />
            <Button
              onClick={handleBulkPriceUpdate}
              disabled={bulkUpdateMutation.isPending || selectedVariantIds.length === 0}
            >
              {t('common:apply', { defaultValue: '应用' })}
            </Button>
          </div>
        </div>

        {/* 批量设置库存 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary flex items-center gap-2">
            <Package size={16} />
            {t('admin:variants.bulkSetStock', { defaultValue: '批量设置库存' })}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              placeholder="0"
              min="0"
              className="flex-1"
            />
            <Button
              onClick={handleBulkStockUpdate}
              disabled={bulkUpdateMutation.isPending || selectedVariantIds.length === 0}
            >
              {t('common:apply', { defaultValue: '应用' })}
            </Button>
          </div>
        </div>

        {/* 价格调整 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            {t('admin:variants.priceAdjustment', { defaultValue: '价格调整' })}
          </label>
          <div className="flex gap-2">
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as 'fixed' | 'percent')}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="fixed">
                {t('admin:variants.fixedAmount', { defaultValue: '固定金额' })}
              </option>
              <option value="percent">
                {t('admin:variants.percentage', { defaultValue: '百分比' })}
              </option>
            </select>
            <Input
              type="number"
              value={priceAdjustment}
              onChange={(e) => setPriceAdjustment(e.target.value)}
              placeholder={adjustmentType === 'fixed' ? '+10 或 -5' : '+10% 或 -5%'}
              step={adjustmentType === 'fixed' ? '1' : '0.1'}
              className="flex-1"
            />
            <Button
              onClick={handlePriceAdjustment}
              disabled={bulkUpdateMutation.isPending || selectedVariantIds.length === 0}
            >
              {t('common:apply', { defaultValue: '应用' })}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VariantBulkEditor;

