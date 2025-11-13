import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Check, X, Image as ImageIcon, Upload, CheckSquare, Square, Settings, Table, Grid, GripVertical } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import VariantBulkEditor from './VariantBulkEditor';
import VariantDetailEditor from './VariantDetailEditor';
import VariantCSVExport from './VariantCSVExport';
import { ProductVariant, UpdateVariantRequest } from '@/types/variant';
import { variantApi } from '@/services/variants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import OptimizedImage from '@/components/common/OptimizedImage';
import { getImageUrl } from '@/utils/imageUrl';
import ImageUpload from '@/components/admin/ImageUpload';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface VariantTableEditorProps {
  productId: string;
  variants: ProductVariant[];
  onVariantUpdated?: () => void;
}

const VariantTableEditor: React.FC<VariantTableEditorProps> = ({
  productId,
  variants,
  onVariantUpdated,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UpdateVariantRequest>>({});
  const [editingImageId, setEditingImageId] = useState<string | null>(null); // 正在编辑图片的变体ID
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]); // 用于批量操作
  const [detailEditorVariant, setDetailEditorVariant] = useState<ProductVariant | null>(null); // 详细编辑的变体
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table'); // 视图模式
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // 拖拽排序
  const [sortedVariants, setSortedVariants] = useState<ProductVariant[]>(variants); // 排序后的变体列表

  // 同步变体列表
  useEffect(() => {
    setSortedVariants([...variants].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
  }, [variants]);

  // 键盘快捷键
  useKeyboardShortcuts(
    [
      {
        key: 's',
        ctrl: true,
        handler: () => {
          if (editingId) {
            handleSaveEdit(editingId);
          }
        },
        description: '保存当前编辑',
      },
      {
        key: 'Escape',
        handler: () => {
          if (editingId) {
            handleCancelEdit();
          }
          if (detailEditorVariant) {
            setDetailEditorVariant(null);
          }
        },
        description: '取消编辑',
      },
      {
        key: 'a',
        ctrl: true,
        handler: () => {
          if (sortedVariants.length > 0) {
            setSelectedVariantIds(sortedVariants.map((v) => v.id));
          }
        },
        description: '全选变体',
      },
      {
        key: 'Delete',
        handler: () => {
          if (selectedVariantIds.length > 0) {
            if (confirm(t('admin:variants.confirmDeleteSelected', { count: selectedVariantIds.length, defaultValue: `确定删除选中的 ${selectedVariantIds.length} 个变体？` }))) {
              selectedVariantIds.forEach((id) => {
                deleteMutation.mutate(id);
              });
              setSelectedVariantIds([]);
            }
          }
        },
        description: '删除选中的变体',
      },
    ],
    true
  );

  // 更新变体
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVariantRequest }) =>
      variantApi.updateVariant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(t('admin:variants.updateSuccess', { defaultValue: '变体更新成功' }));
      setEditingId(null);
      setEditData({});
      onVariantUpdated?.();
    },
    onError: (error: any) => {
      toast.error(error.message || t('admin:variants.updateError', { defaultValue: '变体更新失败' }));
    },
  });

  // 更新变体顺序
  const updateOrderMutation = useMutation({
    mutationFn: (variantIds: string[]) => variantApi.updateVariantsOrder(variantIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      toast.success(t('admin:variants.orderUpdated', { defaultValue: '变体顺序已更新' }));
      onVariantUpdated?.();
    },
    onError: (error: any) => {
      toast.error(error.message || t('admin:variants.orderUpdateError', { defaultValue: '顺序更新失败' }));
      // 恢复原顺序
      setSortedVariants([...variants].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    },
  });

  // 删除变体
  const deleteMutation = useMutation({
    mutationFn: (id: string) => variantApi.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(t('admin:variants.deleteSuccess', { defaultValue: '变体删除成功' }));
      onVariantUpdated?.();
    },
    onError: (error: any) => {
      toast.error(error.message || t('admin:variants.deleteError', { defaultValue: '变体删除失败' }));
    },
  });

  const handleStartEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setEditData({
      price: variant.price,
      comparePrice: variant.comparePrice ?? undefined,
      costPrice: variant.costPrice ?? undefined,
      stock: variant.stock,
      sku: variant.sku,
      images: variant.images || [],
      isActive: variant.isActive,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = (id: string) => {
    updateMutation.mutate({ id, data: editData });
  };

  if (variants.length === 0) {
    return (
      <Card className="p-6 text-center text-text-tertiary">
        {t('admin:variants.noVariants', { defaultValue: '暂无变体' })}
      </Card>
    );
  }

  const handleSelectVariant = (variantId: string) => {
    if (selectedVariantIds.includes(variantId)) {
      setSelectedVariantIds(selectedVariantIds.filter((id) => id !== variantId));
    } else {
      setSelectedVariantIds([...selectedVariantIds, variantId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 批量编辑器 */}
      <VariantBulkEditor
        productId={productId}
        variants={variants}
        selectedVariantIds={selectedVariantIds}
        onSelectedChange={setSelectedVariantIds}
        onUpdated={onVariantUpdated}
      />

      {/* 视图切换按钮和导出 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {t('admin:variants.variantsList', { defaultValue: '变体列表' })}
        </h3>
        <div className="flex items-center gap-2">
          <VariantCSVExport variants={variants} />
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            onClick={() => setViewMode('table')}
            aria-label={t('admin:variants.tableView', { defaultValue: '表格视图' })}
          >
            <Table size={16} className="mr-1" />
            {t('admin:variants.table', { defaultValue: '表格' })}
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'card' ? 'primary' : 'outline'}
            onClick={() => setViewMode('card')}
            aria-label={t('admin:variants.cardView', { defaultValue: '卡片视图' })}
          >
            <Grid size={16} className="mr-1" />
            {t('admin:variants.card', { defaultValue: '卡片' })}
          </Button>
        </div>
      </div>

      {/* 表格视图 */}
      {viewMode === 'table' && (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary w-12">
                  <button
                    onClick={() => {
                      if (selectedVariantIds.length === sortedVariants.length) {
                        setSelectedVariantIds([]);
                      } else {
                        setSelectedVariantIds(sortedVariants.map((v) => v.id));
                      }
                    }}
                    className="p-1"
                    aria-label={t('common:selectAll', { defaultValue: '全选' })}
                  >
                    {selectedVariantIds.length === sortedVariants.length && sortedVariants.length > 0 ? (
                      <CheckSquare size={18} className="text-brand-blue" />
                    ) : (
                      <Square size={18} className="text-text-tertiary" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary w-8">
                  {/* 拖拽手柄列 */}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  {t('admin:variants.image', { defaultValue: '图片' })}
                </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                {t('admin:variants.sku', { defaultValue: 'SKU' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                {t('admin:variants.attributes', { defaultValue: '属性' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                {t('admin:variants.price', { defaultValue: '价格' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                {t('admin:variants.comparePrice', { defaultValue: '原价' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                {t('admin:variants.stock', { defaultValue: '库存' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                {t('admin:variants.status', { defaultValue: '状态' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                {t('common:actions', { defaultValue: '操作' })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedVariants.map((variant, index) => {
              const isEditing = editingId === variant.id;
              const isSelected = selectedVariantIds.includes(variant.id);
              return (
                <tr
                  key={variant.id}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedIndex === null || draggedIndex === index) return;
                    const newVariants = [...sortedVariants];
                    const draggedItem = newVariants[draggedIndex];
                    newVariants.splice(draggedIndex, 1);
                    newVariants.splice(index, 0, draggedItem);
                    setSortedVariants(newVariants);
                    setDraggedIndex(index);
                  }}
                  onDragEnd={() => {
                    if (draggedIndex !== null && draggedIndex !== index) {
                      const newOrder = sortedVariants.map((v) => v.id);
                      updateOrderMutation.mutate(newOrder);
                    }
                    setDraggedIndex(null);
                  }}
                  className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${draggedIndex === index ? 'opacity-50' : ''} cursor-move`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleSelectVariant(variant.id)}
                      className="p-1"
                      aria-label={t('common:select', { defaultValue: '选择' })}
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-brand-blue" />
                      ) : (
                        <Square size={18} className="text-text-tertiary" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center cursor-grab active:cursor-grabbing">
                      <GripVertical size={18} className="text-text-tertiary" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingImageId === variant.id ? (
                      <div className="space-y-2">
                        <ImageUpload
                          images={editData.images || variant.images || []}
                          onChange={(images) => setEditData({ ...editData, images })}
                          maxImages={5}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (editData.images !== undefined) {
                                await updateMutation.mutateAsync({
                                  id: variant.id,
                                  data: { images: editData.images },
                                });
                              }
                              setEditingImageId(null);
                            }}
                            disabled={updateMutation.isPending}
                          >
                            <Check size={14} className="mr-1" />
                            {t('common:save', { defaultValue: '保存' })}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingImageId(null);
                              setEditData((prev) => {
                                const { images, ...rest } = prev;
                                return rest;
                              });
                            }}
                          >
                            <X size={14} className="mr-1" />
                            {t('common:cancel', { defaultValue: '取消' })}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {variant.images && variant.images.length > 0 ? (
                          <div className="relative group">
                            <OptimizedImage
                              src={getImageUrl(variant.images[0])}
                              alt={variant.sku}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            {variant.images.length > 1 && (
                              <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {variant.images.length}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setEditingImageId(variant.id);
                            setEditData({ ...editData, images: variant.images || [] });
                          }}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          aria-label={t('admin:variants.editImage', { defaultValue: '编辑图片' })}
                        >
                          <Upload size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input
                        value={editData.sku || variant.sku}
                        onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm font-mono">{variant.sku}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {variant.attributes?.map((attr) => (
                        <span
                          key={attr.id}
                          className="inline-block px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {attr.attribute?.displayName || attr.attribute?.name || ''}: {attr.value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={String(editData.price ?? variant.price)}
                        onChange={(e) =>
                          setEditData({ ...editData, price: Number(e.target.value) })
                        }
                        className="w-24"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    ) : (
                      <span className="text-sm font-medium text-text-primary">
                        ${Number(variant.price).toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.comparePrice ?? variant.comparePrice ?? ''}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            comparePrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-24"
                        min="0"
                        step="0.01"
                        placeholder="原价"
                      />
                    ) : variant.comparePrice ? (
                      <span className="text-sm text-text-secondary line-through">
                        ${Number(variant.comparePrice).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={String(editData.stock ?? variant.stock)}
                        onChange={(e) =>
                          setEditData({ ...editData, stock: Number(e.target.value) })
                        }
                        className="w-24"
                        min="0"
                      />
                    ) : (
                      <span className="text-sm">{variant.stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={editData.isActive !== undefined ? editData.isActive.toString() : variant.isActive.toString()}
                        onChange={(e) =>
                          setEditData({ ...editData, isActive: e.target.value === 'true' })
                        }
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="true">
                          {t('common:active', { defaultValue: '启用' })}
                        </option>
                        <option value="false">
                          {t('common:inactive', { defaultValue: '禁用' })}
                        </option>
                      </select>
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          variant.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {variant.isActive
                          ? t('common:active', { defaultValue: '启用' })
                          : t('common:inactive', { defaultValue: '禁用' })}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(variant.id)}
                            disabled={updateMutation.isPending}
                            className="p-1 text-green-600 hover:text-green-700"
                            aria-label={t('common:save', { defaultValue: '保存' })}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:text-red-700"
                            aria-label={t('common:cancel', { defaultValue: '取消' })}
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setDetailEditorVariant(variant)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            aria-label={t('admin:variants.detailEdit', { defaultValue: '详细编辑' })}
                            title={t('admin:variants.detailEdit', { defaultValue: '详细编辑' })}
                          >
                            <Settings size={16} />
                          </button>
                          <button
                            onClick={() => handleStartEdit(variant)}
                            className="p-1 text-green-600 hover:text-green-700"
                            aria-label={t('common:quickEdit', { defaultValue: '快速编辑' })}
                            title={t('common:quickEdit', { defaultValue: '快速编辑' })}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t('admin:variants.confirmDelete', { defaultValue: '确定删除此变体？' }))) {
                                deleteMutation.mutate(variant.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1 text-red-600 hover:text-red-700"
                            aria-label={t('common:delete', { defaultValue: '删除' })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
      )}

      {/* 卡片视图 */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedVariants.map((variant) => {
            const isSelected = selectedVariantIds.includes(variant.id);
            const isEditing = editingId === variant.id;
            
            return (
              <Card
                key={variant.id}
                className={`p-4 transition-all ${
                  isSelected ? 'ring-2 ring-brand-blue bg-blue-50' : ''
                } ${isEditing ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* 选择框 */}
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => handleSelectVariant(variant.id)}
                    className="p-1"
                    aria-label={t('common:select', { defaultValue: '选择' })}
                  >
                    {isSelected ? (
                      <CheckSquare size={18} className="text-brand-blue" />
                    ) : (
                      <Square size={18} className="text-text-tertiary" />
                    )}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDetailEditorVariant(variant)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      aria-label={t('admin:variants.detailEdit', { defaultValue: '详细编辑' })}
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => handleStartEdit(variant)}
                      className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                      aria-label={t('common:quickEdit', { defaultValue: '快速编辑' })}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('admin:variants.confirmDelete', { defaultValue: '确定删除此变体？' }))) {
                          deleteMutation.mutate(variant.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      aria-label={t('common:delete', { defaultValue: '删除' })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* 图片 */}
                <div className="mb-3">
                  {editingImageId === variant.id ? (
                    <div className="space-y-2">
                      <ImageUpload
                        images={editData.images || variant.images || []}
                        onChange={(images) => setEditData({ ...editData, images })}
                        maxImages={5}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (editData.images !== undefined) {
                              await updateMutation.mutateAsync({
                                id: variant.id,
                                data: { images: editData.images },
                              });
                            }
                            setEditingImageId(null);
                          }}
                          disabled={updateMutation.isPending}
                        >
                          <Check size={14} className="mr-1" />
                          {t('common:save', { defaultValue: '保存' })}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingImageId(null);
                            setEditData((prev) => {
                              const { images, ...rest } = prev;
                              return rest;
                            });
                          }}
                        >
                          <X size={14} className="mr-1" />
                          {t('common:cancel', { defaultValue: '取消' })}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      {variant.images && variant.images.length > 0 ? (
                        <>
                          <OptimizedImage
                            src={getImageUrl(variant.images[0])}
                            alt={variant.sku}
                            className="w-full h-full object-cover"
                          />
                          {variant.images.length > 1 && (
                            <span className="absolute top-2 right-2 bg-brand-blue text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                              {variant.images.length}
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={32} className="text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setEditingImageId(variant.id);
                          setEditData({ ...editData, images: variant.images || [] });
                        }}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                        aria-label={t('admin:variants.editImage', { defaultValue: '编辑图片' })}
                      >
                        <Upload size={20} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* SKU */}
                <div className="mb-2">
                  <span className="text-xs text-text-tertiary">{t('admin:variants.sku', { defaultValue: 'SKU' })}:</span>
                  {isEditing ? (
                    <Input
                      value={editData.sku || variant.sku}
                      onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <div className="font-mono text-sm font-medium">{variant.sku}</div>
                  )}
                </div>

                {/* 属性 */}
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {variant.attributes?.map((attr) => (
                      <span
                        key={attr.id}
                        className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs"
                      >
                        {attr.attribute?.displayName || attr.attribute?.name || ''}: {attr.value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 价格和库存 */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <span className="text-xs text-text-tertiary">{t('admin:variants.price', { defaultValue: '价格' })}:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={String(editData.price ?? variant.price)}
                        onChange={(e) =>
                          setEditData({ ...editData, price: Number(e.target.value) })
                        }
                        className="mt-1"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <div className="text-sm font-medium">
                        ${Number(variant.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary">{t('admin:variants.stock', { defaultValue: '库存' })}:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={String(editData.stock ?? variant.stock)}
                        onChange={(e) =>
                          setEditData({ ...editData, stock: Number(e.target.value) })
                        }
                        className="mt-1"
                        min="0"
                      />
                    ) : (
                      <div className={`text-sm font-medium ${
                        variant.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {variant.stock}
                      </div>
                    )}
                  </div>
                </div>

                {/* 状态 */}
                <div className="mb-2">
                  {isEditing ? (
                    <select
                      value={editData.isActive !== undefined ? editData.isActive.toString() : variant.isActive.toString()}
                      onChange={(e) =>
                        setEditData({ ...editData, isActive: e.target.value === 'true' })
                      }
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="true">
                        {t('common:active', { defaultValue: '启用' })}
                      </option>
                      <option value="false">
                        {t('common:inactive', { defaultValue: '禁用' })}
                      </option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        variant.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {variant.isActive
                        ? t('common:active', { defaultValue: '启用' })
                        : t('common:inactive', { defaultValue: '禁用' })}
                    </span>
                  )}
                </div>

                {/* 编辑操作按钮 */}
                {isEditing && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(variant.id)}
                      disabled={updateMutation.isPending}
                      className="flex-1"
                    >
                      <Check size={14} className="mr-1" />
                      {t('common:save', { defaultValue: '保存' })}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      <X size={14} className="mr-1" />
                      {t('common:cancel', { defaultValue: '取消' })}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* 变体详细编辑模态框 */}
      {detailEditorVariant && (
        <VariantDetailEditor
          variant={detailEditorVariant}
          productId={productId}
          isOpen={!!detailEditorVariant}
          onClose={() => setDetailEditorVariant(null)}
          onUpdated={() => {
            onVariantUpdated?.();
            setDetailEditorVariant(null);
          }}
        />
      )}
    </div>
  );
};

export default VariantTableEditor;

