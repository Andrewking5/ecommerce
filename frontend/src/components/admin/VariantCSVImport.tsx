import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { parseCSV, VariantCSVRow } from '@/utils/csvParser';
import { variantApi } from '@/services/variants';
import { attributeApi } from '@/services/attributes';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productApi } from '@/services/products';

interface VariantCSVImportProps {
  productId: string;
  categoryId?: string;
  onImportComplete?: () => void;
}

const VariantCSVImport: React.FC<VariantCSVImportProps> = ({
  productId,
  categoryId,
  onImportComplete,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [csvText, setCsvText] = useState('');
  const [previewData, setPreviewData] = useState<VariantCSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // 获取商品信息以获取 categoryId
  const { data: product } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProduct(productId),
    enabled: !!productId && !categoryId,
  });

  const finalCategoryId = categoryId || product?.categoryId;

  // 获取属性列表
  const { data: attributes = [] } = useQuery({
    queryKey: ['attributes', finalCategoryId],
    queryFn: () => attributeApi.getAttributes({ categoryId: finalCategoryId }),
    enabled: !!finalCategoryId,
  });

  // 批量创建变体
  const importMutation = useMutation({
    mutationFn: async (variants: VariantCSVRow[]) => {
      if (attributes.length === 0) {
        throw new Error(t('admin:variants.noAttributes', { defaultValue: '请先创建属性' }));
      }

      // 创建属性名到属性ID的映射
      const attributeMap = new Map<string, string>();
      attributes.forEach((attr) => {
        const displayName = attr.displayName || attr.name;
        attributeMap.set(displayName.toLowerCase(), attr.id);
        attributeMap.set(attr.name.toLowerCase(), attr.id);
      });

      // 将 CSV 数据转换为 API 格式
      const variantsToCreate = variants.map((row) => {
        const variantAttributes: { attributeId: string; value: string }[] = [];
        
        // 匹配属性名到属性ID
        Object.entries(row.attributes).forEach(([name, value]) => {
          const attrId = attributeMap.get(name.toLowerCase());
          if (!attrId) {
            throw new Error(
              t('admin:variants.attributeNotFound', {
                defaultValue: `属性 "${name}" 未找到`,
                name,
              })
            );
          }
          variantAttributes.push({ attributeId: attrId, value });
        });

        return {
          productId,
          sku: row.sku,
          price: row.price,
          comparePrice: row.comparePrice,
          stock: row.stock,
          images: row.images || [],
          isActive: row.isActive ?? true,
          attributes: variantAttributes,
        };
      });

      // 逐个创建变体
      const results = [];
      for (const variant of variantsToCreate) {
        try {
          const created = await variantApi.createVariant(variant);
          results.push(created);
        } catch (error: any) {
          console.error('Failed to create variant:', error);
          throw new Error(
            `创建变体 ${variant.sku} 失败: ${error.message || '未知错误'}`
          );
        }
      }
      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(
        t('admin:variants.csvImportSuccess', {
          count: data.length,
          defaultValue: `成功导入 ${data.length} 个变体`,
        })
      );
      setCsvText('');
      setPreviewData([]);
      setErrors([]);
      onImportComplete?.();
    },
    onError: (error: any) => {
      toast.error(error.message || t('admin:variants.csvImportError', { defaultValue: 'CSV导入失败' }));
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseAndPreview(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseAndPreview = (text: string) => {
    try {
      const parsed = parseCSV(text);
      setPreviewData(parsed);
      setErrors([]);

      // 验证数据
      const validationErrors: string[] = [];
      parsed.forEach((row, index) => {
        if (!row.sku) {
          validationErrors.push(`第 ${index + 2} 行：缺少 SKU`);
        }
        if (row.price <= 0) {
          validationErrors.push(`第 ${index + 2} 行：价格无效`);
        }
        if (Object.keys(row.attributes).length === 0) {
          validationErrors.push(`第 ${index + 2} 行：缺少属性`);
        }
      });

      setErrors(validationErrors);
    } catch (error: any) {
      toast.error(error.message || t('admin:variants.csvParseError', { defaultValue: 'CSV解析失败' }));
    }
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      toast.error(t('admin:variants.noDataToImport', { defaultValue: '没有可导入的数据' }));
      return;
    }

    if (errors.length > 0) {
      toast.error(t('admin:variants.fixErrors', { defaultValue: '请先修复错误' }));
      return;
    }

    importMutation.mutate(previewData);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="text-brand-blue" size={20} />
        <h3 className="text-lg font-semibold">
          {t('admin:variants.csvImport', { defaultValue: 'CSV 导入变体' })}
        </h3>
      </div>

      <div className="space-y-4">
        {/* 文件上传 */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('admin:variants.selectCSVFile', { defaultValue: '选择 CSV 文件' })}
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue/80"
          />
        </div>

        {/* 或直接粘贴 CSV */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('admin:variants.pasteCSV', { defaultValue: '或直接粘贴 CSV 内容' })}
          </label>
          <textarea
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              if (e.target.value.trim()) {
                parseAndPreview(e.target.value);
              } else {
                setPreviewData([]);
                setErrors([]);
              }
            }}
            placeholder="SKU,颜色,尺寸,Price,Stock&#10;SKU-001,红色,S,29.99,100"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none font-mono text-sm"
            rows={6}
          />
        </div>

        {/* 预览数据 */}
        {previewData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('admin:variants.preview', { defaultValue: '预览' })} ({previewData.length}{' '}
                {t('admin:variants.rows', { defaultValue: '行' })})
              </span>
              {errors.length === 0 ? (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={16} />
                  {t('admin:variants.valid', { defaultValue: '数据有效' })}
                </span>
              ) : (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.length} {t('admin:variants.errors', { defaultValue: '个错误' })}
                </span>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left">SKU</th>
                    <th className="px-2 py-2 text-left">
                      {t('admin:variants.attributes', { defaultValue: '属性' })}
                    </th>
                    <th className="px-2 py-2 text-left">
                      {t('admin:variants.price', { defaultValue: '价格' })}
                    </th>
                    <th className="px-2 py-2 text-left">
                      {t('admin:variants.stock', { defaultValue: '库存' })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-2 font-mono">{row.sku}</td>
                      <td className="px-2 py-2">
                        {Object.entries(row.attributes)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </td>
                      <td className="px-2 py-2">${row.price.toFixed(2)}</td>
                      <td className="px-2 py-2">{row.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <div className="text-center py-2 text-xs text-text-tertiary">
                  {t('admin:variants.moreRows', {
                    count: previewData.length - 10,
                    defaultValue: `还有 ${previewData.length - 10} 行...`,
                  })}
                </div>
              )}
            </div>

            {/* 错误列表 */}
            {errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm font-medium text-red-800 mb-2">
                  {t('admin:variants.validationErrors', { defaultValue: '验证错误' })}:
                </div>
                <ul className="text-xs text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 导入按钮 */}
        <Button
          onClick={handleImport}
          disabled={previewData.length === 0 || errors.length > 0 || importMutation.isPending}
          className="w-full"
          size="lg"
        >
          <Upload size={16} className="mr-2" />
          {importMutation.isPending
            ? t('common:importing', { defaultValue: '导入中...' })
            : t('admin:variants.import', { count: previewData.length, defaultValue: `导入 ${previewData.length} 个变体` })}
        </Button>
      </div>
    </Card>
  );
};

export default VariantCSVImport;

