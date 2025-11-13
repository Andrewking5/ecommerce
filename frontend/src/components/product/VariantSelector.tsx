import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Check } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductVariant } from '@/types/variant';
import { ProductAttribute, AttributeType, ProductVariantAttribute } from '@/types/variant';

interface VariantSelectorProps {
  product: Product;
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant | null) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange,
}) => {
  const { t } = useTranslation(['products', 'common']);

  // 从变体中提取所有属性
  const attributes = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    
    const attrMap = new Map<string, ProductAttribute>();
    variants.forEach((variant) => {
      variant.attributes?.forEach((vAttr: ProductVariantAttribute) => {
        if (vAttr.attribute && !attrMap.has(vAttr.attribute.id)) {
          attrMap.set(vAttr.attribute.id, vAttr.attribute);
        }
      });
    });
    
    return Array.from(attrMap.values()).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [variants]);

  // 从变体中提取每个属性的所有可能值
  const attributeValues = useMemo(() => {
    const valuesMap: Record<string, Set<string>> = {};
    
    variants.forEach((variant) => {
      variant.attributes?.forEach((vAttr: ProductVariantAttribute) => {
        if (vAttr.attribute) {
          const attrId = vAttr.attribute.id;
          if (!valuesMap[attrId]) {
            valuesMap[attrId] = new Set();
          }
          valuesMap[attrId].add(vAttr.value);
        }
      });
    });
    
    const result: Record<string, string[]> = {};
    Object.keys(valuesMap).forEach((attrId) => {
      result[attrId] = Array.from(valuesMap[attrId]);
    });
    
    return result;
  }, [variants]);

  // 当前选择的属性值
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<string, string>>({});

  // 根据选择的属性值找到对应的变体
  const findVariantByAttributes = (attrValues: Record<string, string>): ProductVariant | null => {
    if (Object.keys(attrValues).length === 0) return null;
    
    return variants.find((variant) => {
      const variantAttrs = variant.attributes || [];
      return Object.entries(attrValues).every(([attrId, value]) => {
        return variantAttrs.some(
          (vAttr) => vAttr.attribute?.id === attrId && vAttr.value === value
        );
      });
    }) || null;
  };

  // 检查某个属性值是否可用（是否有对应的变体）
  const isAttributeValueAvailable = (attrId: string, value: string): boolean => {
    const testValues = { ...selectedAttributeValues, [attrId]: value };
    return findVariantByAttributes(testValues) !== null;
  };

  // 处理属性值选择
  const handleAttributeValueSelect = (attrId: string, value: string) => {
    const newSelectedValues = { ...selectedAttributeValues, [attrId]: value };
    setSelectedAttributeValues(newSelectedValues);
    
    const matchedVariant = findVariantByAttributes(newSelectedValues);
    onVariantChange(matchedVariant);
  };

  // 初始化：选择默认变体
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      const defaultVariant = variants.find((v) => v.isDefault) || variants[0];
      if (defaultVariant) {
        const initialValues: Record<string, string> = {};
        defaultVariant.attributes?.forEach((vAttr) => {
          if (vAttr.attribute) {
            initialValues[vAttr.attribute.id] = vAttr.value;
          }
        });
        setSelectedAttributeValues(initialValues);
        onVariantChange(defaultVariant);
      }
    }
  }, [variants]);

  // 当 selectedVariant 从外部改变时，更新内部状态
  useEffect(() => {
    if (selectedVariant) {
      const values: Record<string, string> = {};
      selectedVariant.attributes?.forEach((vAttr) => {
        if (vAttr.attribute) {
          values[vAttr.attribute.id] = vAttr.value;
        }
      });
      setSelectedAttributeValues(values);
    }
  }, [selectedVariant?.id]);

  if (attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {attributes.map((attribute) => {
        const values = attributeValues[attribute.id] || [];
        const selectedValue = selectedAttributeValues[attribute.id];
        const isColor = attribute.type === AttributeType.COLOR;

        return (
          <div key={attribute.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">
                {attribute.displayName || attribute.name}:
                {attribute.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              {selectedValue && (
                <span className="text-sm text-text-secondary">{selectedValue}</span>
              )}
            </div>

            <div className={`flex flex-wrap gap-2 ${isColor ? 'gap-3' : 'gap-2'}`}>
              {values.map((value) => {
                const isSelected = selectedValue === value;
                const isAvailable = isAttributeValueAvailable(attribute.id, value);

                if (isColor) {
                  // 颜色选择器：圆形色块
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAttributeValueSelect(attribute.id, value)}
                      disabled={!isAvailable}
                      className={`
                        relative w-10 h-10 rounded-full border-2 transition-all
                        ${isSelected
                          ? 'border-brand-blue ring-2 ring-brand-blue/20 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                        }
                        ${!isAvailable
                          ? 'opacity-50 cursor-not-allowed grayscale'
                          : 'cursor-pointer hover:scale-105'
                        }
                      `}
                      style={{
                        backgroundColor: value.toLowerCase() === 'white' ? '#ffffff' : 
                                       value.toLowerCase() === 'black' ? '#000000' :
                                       value.toLowerCase() === 'red' ? '#ef4444' :
                                       value.toLowerCase() === 'blue' ? '#3b82f6' :
                                       value.toLowerCase() === 'green' ? '#22c55e' :
                                       value.toLowerCase() === 'yellow' ? '#eab308' :
                                       value.toLowerCase() === 'pink' ? '#ec4899' :
                                       value.toLowerCase() === 'purple' ? '#a855f7' :
                                       value.toLowerCase() === 'orange' ? '#f97316' :
                                       value.toLowerCase() === 'gray' ? '#6b7280' :
                                       value, // 尝试直接使用值作为颜色
                      }}
                      title={value}
                      aria-label={`选择颜色 ${value}`}
                    >
                      {isSelected && (
                        <Check
                          size={16}
                          className="absolute inset-0 m-auto text-white drop-shadow-md"
                          style={{
                            filter: value.toLowerCase() === 'white' || value.toLowerCase() === 'yellow' 
                              ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' 
                              : 'none',
                          }}
                        />
                      )}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                        </div>
                      )}
                    </button>
                  );
                } else {
                  // 其他属性：矩形按钮
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAttributeValueSelect(attribute.id, value)}
                      disabled={!isAvailable}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all
                        ${isSelected
                          ? 'border-brand-blue bg-brand-blue text-white'
                          : 'border-gray-300 bg-white text-text-primary hover:border-gray-400'
                        }
                        ${!isAvailable
                          ? 'opacity-50 cursor-not-allowed line-through'
                          : 'cursor-pointer hover:bg-gray-50'
                        }
                      `}
                      title={!isAvailable ? t('products:variant.unavailable', { defaultValue: '此组合不可用' }) : value}
                      aria-label={`选择 ${attribute.displayName || attribute.name} ${value}`}
                    >
                      {value}
                    </button>
                  );
                }
              })}
            </div>

            {/* 检查当前选择的属性组合是否可用 */}
            {selectedValue && (() => {
              const currentCombination = findVariantByAttributes(selectedAttributeValues);
              const isCombinationAvailable = currentCombination !== null;
              
              // 只有当所有属性都已选择，但组合不可用时才显示错误
              const allAttributesSelected = attributes.every(attr => 
                selectedAttributeValues[attr.id] !== undefined
              );
              
              if (!isCombinationAvailable && allAttributesSelected) {
                return (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {t('products:variant.combinationUnavailable', { defaultValue: '此属性组合不可用' })}
                  </p>
                );
              }
              return null;
            })()}
          </div>
        );
      })}

      {/* 显示选中变体的信息 */}
      {selectedVariant && (
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {t('products:variant.selected', { defaultValue: '已选择' })}:
            </span>
            <span className="text-sm font-medium text-text-primary">
              {selectedVariant.attributes?.map((a: ProductVariantAttribute) => a.value).join(' / ')}
            </span>
          </div>
          {selectedVariant.stock <= 0 && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {t('products:variant.outOfStock', { defaultValue: '缺货' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VariantSelector;

