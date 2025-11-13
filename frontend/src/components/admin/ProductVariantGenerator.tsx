import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, CheckCircle2, AlertCircle, DollarSign, ChevronDown, ChevronUp, Eye, EyeOff, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ProductAttribute, AttributeType } from '@/types/variant';
import { variantApi } from '@/services/variants';
import { attributeApi as attrApi } from '@/services/attributes';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ProductVariantGeneratorProps {
  productId: string;
  attributes: ProductAttribute[]; // 可以传入，也可以内部获取
  attributeValues: Record<string, string[]>; // attributeId -> values[]
  onVariantsGenerated?: (data?: { basePrice?: string; defaultStock?: string }) => void;
  categoryId?: string; // 用于获取属性列表
}

const ProductVariantGenerator: React.FC<ProductVariantGeneratorProps> = ({
  productId,
  attributes: propsAttributes,
  attributeValues,
  onVariantsGenerated,
  categoryId,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [basePrice, setBasePrice] = useState<string>('');
  const [defaultStock, setDefaultStock] = useState<string>('0');
  const [skuPattern, setSkuPattern] = useState<string>('');
  const [priceRules, setPriceRules] = useState<Record<string, Record<string, number>>>({}); // {attributeId: {value: priceAdjustment}}
  const [showPriceRules, setShowPriceRules] = useState(false);
  const [showPricePreview, setShowPricePreview] = useState(false);

  // 如果没有传入属性，则从API获取
  const { data: fetchedAttributes = [] } = useQuery({
    queryKey: ['attributes', categoryId],
    queryFn: () => attrApi.getAttributes({ categoryId }),
    enabled: (!propsAttributes || propsAttributes.length === 0) && Object.keys(attributeValues).length > 0,
  });

  // 优先使用传入的属性，否则从API获取，如果都没有则从attributeValues的key构建
  const attributes = useMemo(() => {
    if (propsAttributes && propsAttributes.length > 0) {
      return propsAttributes;
    }
    if (fetchedAttributes.length > 0) {
      return fetchedAttributes;
    }
    // 如果都没有，从attributeValues的key构建属性对象（用于显示）
    return Object.keys(attributeValues).map((attrId) => ({
      id: attrId,
      name: attrId,
      displayName: attrId,
      type: AttributeType.SELECT,
      values: [],
      isRequired: false,
      displayOrder: 0,
      createdAt: '',
      updatedAt: '',
    })) as ProductAttribute[];
  }, [propsAttributes, fetchedAttributes, attributeValues]);

  // 计算所有可能的变体组合
  const variantCombinations = useMemo(() => {
    // 检查是否有属性值和有效的属性
    const attributeValueKeys = Object.keys(attributeValues || {}).filter(
      (key) => attributeValues[key] && Array.isArray(attributeValues[key]) && attributeValues[key].length > 0
    );

    if (attributeValueKeys.length === 0) {
      return [];
    }

    // 获取所有属性的值数组（从attributeValues中匹配）
    const attributeValueArrays = attributeValueKeys
      .map((attrId) => {
        // 尝试从attributes中找到对应的属性对象
        const attr = attributes.find((a) => a.id === attrId);
        const values = attributeValues[attrId];
        
        if (!values || !Array.isArray(values) || values.length === 0) {
          return null;
        }

        return {
          attributeId: attrId,
          attributeName: attr?.displayName || attr?.name || attrId,
          values: values,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (attributeValueArrays.length === 0) {
      return [];
    }

    // 生成所有组合（笛卡尔积）
    const generateCombinations = (arrays: typeof attributeValueArrays): Array<Array<{ attributeId: string; value: string }>> => {
      if (arrays.length === 0) return [[]];
      if (arrays.length === 1) {
        return arrays[0].values.map((value) => [{ attributeId: arrays[0].attributeId, value }]);
      }

      const [first, ...rest] = arrays;
      const restCombinations = generateCombinations(rest);
      const combinations: Array<Array<{ attributeId: string; value: string }>> = [];

      for (const value of first.values) {
        for (const restCombination of restCombinations) {
          combinations.push([{ attributeId: first.attributeId, value }, ...restCombination]);
        }
      }

      return combinations;
    };

    return generateCombinations(attributeValueArrays);
  }, [attributes, attributeValues]); // 依赖 attributes 和 attributeValues

  // 计算价格预览数据
  const variantPreviewData = useMemo(() => {
    if (!variantCombinations || variantCombinations.length === 0 || !basePrice || isNaN(Number(basePrice))) {
      return [];
    }

    const basePriceNum = Number(basePrice);
    
    return variantCombinations.map((combination) => {
      if (!combination || !Array.isArray(combination)) {
        return null;
      }

      // 计算总价格调整
      let totalAdjustment = 0;
      combination.forEach(({ attributeId, value }) => {
        const adjustment = priceRules[attributeId]?.[value] || 0;
        totalAdjustment += adjustment;
      });

      const finalPrice = basePriceNum + totalAdjustment;

      // 生成SKU
      let sku = '';
      if (skuPattern) {
        sku = combination.reduce((acc, { attributeId, value }) => {
          const attr = attributes.find((a) => a.id === attributeId);
          const attrName = (attr?.name || attr?.displayName || attributeId).toLowerCase();
          return acc.replace(`{${attrName}}`, value).replace(`{${attr?.name || ''}}`, value);
        }, skuPattern);
      } else {
        // 默认SKU格式
        sku = combination.map(({ value }) => value).join('-');
      }

      // 构建属性数组用于显示
      const attributesList = combination.map(({ attributeId, value }) => {
        const attr = attributes.find((a) => a.id === attributeId);
        return {
          name: attr?.displayName || attr?.name || attributeId,
          value: value,
        };
      });

      return {
        combination,
        attributes: attributesList,
        price: finalPrice,
        sku,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [variantCombinations, basePrice, priceRules, skuPattern, attributes]);

    // 批量创建变体
  const createBulkMutation = useMutation({
    mutationFn: (data: any) => variantApi.createVariantsBulk(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(
        t('admin:variants.bulkCreateSuccess', {
          count: response.count,
          defaultValue: `成功创建 ${response.count} 个变体`,
        })
      );
      onVariantsGenerated?.({ basePrice, defaultStock });
    },
    onError: (error: any) => {
      toast.error(error.message || t('admin:variants.bulkCreateError', { defaultValue: '批量创建变体失败' }));
    },
  });

  const handleGenerateVariants = () => {
    if (productId === 'new') {
      toast.error(t('admin:variants.saveProductFirst', { defaultValue: '请先保存商品，然后再生成变体' }));
      return;
    }

    if (variantCombinations.length === 0) {
      toast.error(t('admin:variants.noCombinations', { defaultValue: '没有可生成的变体组合' }));
      return;
    }

    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
      toast.error(t('admin:variants.invalidPrice', { defaultValue: '请输入有效的基础价格' }));
      return;
    }

    const attributesForBulk = attributes
      .filter((attr) => attributeValues[attr.id] && attributeValues[attr.id].length > 0)
      .map((attr) => ({
        attributeId: attr.id,
        values: attributeValues[attr.id],
      }));

    createBulkMutation.mutate({
      productId,
      attributes: attributesForBulk,
      basePrice: Number(basePrice),
      defaultStock: Number(defaultStock) || 0,
      skuPattern: skuPattern || undefined,
      priceRules: Object.keys(priceRules).length > 0 ? priceRules : undefined,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-brand-blue" size={20} />
          <h3 className="text-lg font-semibold">
            {t('admin:variants.generator', { defaultValue: '变体生成器' })}
          </h3>
        </div>
        {variantCombinations.length > 0 && (
          <div
            className="group relative"
            title={t('admin:variants.generatorHelp', {
              defaultValue: '系统将自动生成所有属性组合的变体。例如：颜色(红、蓝) × 尺寸(S、M) = 4个变体',
            })}
          >
            <Info size={16} className="text-text-tertiary cursor-help" />
            <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {t('admin:variants.generatorHelp', {
                defaultValue: '系统将自动生成所有属性组合的变体。例如：颜色(红、蓝) × 尺寸(S、M) = 4个变体',
              })}
            </div>
          </div>
        )}
      </div>

      {/* 预览信息 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {variantCombinations.length > 0 ? (
            <CheckCircle2 className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-yellow-500" size={20} />
          )}
          <span className="font-medium">
            {t('admin:variants.combinationsCount', {
              count: variantCombinations.length,
              defaultValue: `将生成 ${variantCombinations.length} 个变体组合`,
            })}
          </span>
        </div>
        {variantCombinations.length > 0 && (
          <div className="text-sm text-text-secondary mt-2">
            {attributes
              .filter((attr) => attributeValues[attr.id] && attributeValues[attr.id].length > 0)
              .map((attr) => `${attr.displayName || attr.name}: ${attributeValues[attr.id].length} 个值`)
              .join(' × ')}
          </div>
        )}
      </div>

      {/* 配置表单 */}
      <div className="space-y-4">
        <Input
          label={t('admin:variants.basePrice', { defaultValue: '基础价格' })}
          type="number"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          placeholder="0.00"
          required
          min="0"
          step="0.01"
        />

        <Input
          label={t('admin:variants.defaultStock', { defaultValue: '默认库存' })}
          type="number"
          value={defaultStock}
          onChange={(e) => setDefaultStock(e.target.value)}
          placeholder="0"
          min="0"
        />

        <Input
          label={t('admin:variants.skuPattern', { defaultValue: 'SKU 生成模式（可选）' })}
          value={skuPattern}
          onChange={(e) => setSkuPattern(e.target.value)}
          placeholder="PROD-{color}-{size}"
          helperText={t('admin:variants.skuPatternHelp', {
            defaultValue: '使用 {属性名} 作为占位符，如: PROD-{color}-{size}',
          })}
        />

        {/* 价格规则设置 */}
        <div className="border rounded-lg p-4">
          <button
            type="button"
            onClick={() => setShowPriceRules(!showPriceRules)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-brand-blue" />
              <span className="font-medium">
                {t('admin:variants.priceRules', { defaultValue: '价格规则（可选）' })}
              </span>
            </div>
            {showPriceRules ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showPriceRules && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-text-secondary">
                {t('admin:variants.priceRulesHelp', {
                  defaultValue: '为不同属性值设置价格调整，例如：XL尺寸+$10，红色+$5',
                })}
              </p>
              {attributes
                .filter((attr) => attributeValues[attr.id] && attributeValues[attr.id].length > 0)
                .map((attr) => {
                  const values = attributeValues[attr.id] || [];
                  return (
                    <div key={attr.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="font-medium mb-2 text-sm">
                        {attr.displayName || attr.name}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {values.map((value) => {
                          const currentRule = priceRules[attr.id]?.[value];
                          const currentRuleStr = currentRule !== undefined && currentRule !== 0 ? String(currentRule) : '';
                          return (
                            <div key={value} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-text-secondary flex-1 truncate">{value}</span>
                                <Input
                                  type="number"
                                  value={currentRuleStr}
                                  onChange={(e) => {
                                    const adjustment = e.target.value ? Number(e.target.value) : 0;
                                    setPriceRules({
                                      ...priceRules,
                                      [attr.id]: {
                                        ...(priceRules[attr.id] || {}),
                                        [value]: adjustment,
                                      },
                                    });
                                  }}
                                  placeholder="+10 或 -5"
                                  step="0.01"
                                  className="w-20 text-sm"
                                />
                              </div>
                              <div className="text-xs text-text-tertiary pl-1">
                                {attr.displayName || attr.name}: {value}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* 价格预览表格 */}
        {variantCombinations.length > 0 && basePrice && variantPreviewData.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <button
              type="button"
              onClick={() => setShowPricePreview(!showPricePreview)}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-brand-blue" />
                <span className="font-medium">
                  {t('admin:variants.pricePreview', { defaultValue: '价格预览' })}
                </span>
                <span className="text-sm text-text-secondary">
                  ({variantPreviewData.length} {t('admin:variants.variants', { defaultValue: '个变体' })})
                </span>
              </div>
              {showPricePreview ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            {showPricePreview && variantPreviewData.length > 0 && (
              <div className="mt-4 max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-primary border-b">
                        {t('admin:variants.attributes', { defaultValue: '属性组合' })}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-primary border-b">
                        {t('admin:variants.price', { defaultValue: '价格' })}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-primary border-b">
                        {t('admin:variants.sku', { defaultValue: 'SKU预览' })}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {variantPreviewData && Array.isArray(variantPreviewData) && variantPreviewData.length > 0 ? (
                      variantPreviewData.map((item, index) => {
                        if (!item || !item.attributes || !Array.isArray(item.attributes)) {
                          return null;
                        }
                        const isPriceValid = item.price > 0;
                        return (
                          <tr
                            key={index}
                            className={`hover:bg-gray-50 ${
                              !isPriceValid ? 'bg-red-50' : ''
                            }`}
                          >
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {item.attributes.map((attr, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs"
                                  >
                                    <span className="font-medium">{attr.name}:</span>{' '}
                                    <span className="text-text-secondary">{attr.value}</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                          <td className="px-3 py-2">
                            <span
                              className={`font-medium ${
                                !isPriceValid
                                  ? 'text-red-500'
                                  : item.price !== Number(basePrice)
                                  ? 'text-brand-blue'
                                  : 'text-text-primary'
                              }`}
                            >
                              ${item.price.toFixed(2)}
                            </span>
                            {!isPriceValid && (
                              <span className="ml-2 text-xs text-red-500">
                                {t('admin:variants.invalidPrice', { defaultValue: '无效' })}
                              </span>
                            )}
                          </td>
                            <td className="px-3 py-2">
                              <span className="font-mono text-xs text-text-secondary">
                                {item.sku || '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-sm text-text-secondary">
                          {t('admin:variants.noPreviewData', { defaultValue: '暂无预览数据' })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleGenerateVariants}
          disabled={variantCombinations.length === 0 || createBulkMutation.isPending || productId === 'new'}
          className="w-full"
          size="lg"
        >
          {productId === 'new'
            ? t('admin:variants.saveProductFirst', { defaultValue: '请先保存商品' })
            : createBulkMutation.isPending
            ? t('common:loading', { defaultValue: '生成中...' })
            : t('admin:variants.generate', {
                count: variantCombinations.length,
                defaultValue: `生成 ${variantCombinations.length} 个变体`,
              })}
        </Button>
      </div>

      {/* 组合预览（前5个） */}
      {variantCombinations.length > 0 && variantCombinations.length <= 20 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">
            {t('admin:variants.preview', { defaultValue: '组合预览' })}
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {variantCombinations.slice(0, 10).map((combination, index) => (
              <div
                key={index}
                className="p-2 bg-white border rounded text-sm text-text-secondary"
              >
                {combination
                  .map((c) => {
                    const attr = attributes.find((a) => a.id === c.attributeId);
                    return `${attr?.displayName || attr?.name || ''}: ${c.value}`;
                  })
                  .join(' / ')}
              </div>
            ))}
            {variantCombinations.length > 10 && (
              <div className="text-center text-sm text-text-tertiary pt-2">
                {t('admin:variants.moreCombinations', {
                  count: variantCombinations.length - 10,
                  defaultValue: `还有 ${variantCombinations.length - 10} 个组合...`,
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductVariantGenerator;

