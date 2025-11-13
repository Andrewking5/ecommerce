import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Zap, ChevronDown, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import AttributeValuesEditor from './AttributeValuesEditor';
import { ProductAttribute, AttributeType, CreateAttributeRequest } from '@/types/variant';
import { attributeApi } from '@/services/attributes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ProductAttributeManagerProps {
  categoryId?: string;
  selectedAttributes: string[]; // 已选择的属性ID数组
  onAttributesChange: (attributeIds: string[]) => void;
  onAttributeValuesChange?: (attributeId: string, values: string[]) => void;
  onSelectedAttributesChange?: (attributes: ProductAttribute[]) => void; // 传递选中的属性对象
}

const ProductAttributeManager: React.FC<ProductAttributeManagerProps> = ({
  categoryId,
  selectedAttributes,
  onAttributesChange,
  onAttributeValuesChange,
  onSelectedAttributesChange,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAttribute, setNewAttribute] = useState<Partial<CreateAttributeRequest>>({
    name: '',
    displayName: '',
    type: AttributeType.SELECT,
    values: [],
    isRequired: false,
    displayOrder: 0,
  });
  const [attributeValues, setAttributeValues] = useState<Record<string, string[]>>({});
  const [showTemplates, setShowTemplates] = useState(false);

  // 点击外部关闭模板菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTemplates && !target.closest('.template-dropdown')) {
        setShowTemplates(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTemplates]);

  // 获取属性列表
  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ['attributes', categoryId],
    queryFn: () => attributeApi.getAttributes({ categoryId }),
  });

  // 去重处理：相同名称或显示名称的属性只保留一个（保留最新的）
  const uniqueAttributes = useMemo(() => {
    const seen = new Map<string, ProductAttribute>();
    const commonAttributeNames = ['颜色', 'color', '尺寸', 'size', '配置', 'configuration', '尺码'];
    
    // 先按创建时间排序（最新的在前）
    const sorted = [...attributes].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });

    // 去重：优先保留常用属性，然后按名称去重
    sorted.forEach((attr) => {
      const key = (attr.displayName || attr.name).toLowerCase().trim();
      const nameKey = attr.name.toLowerCase().trim();
      
      // 如果是常用属性，优先保留
      const isCommon = commonAttributeNames.some(
        (commonName) => key.includes(commonName.toLowerCase()) || nameKey.includes(commonName.toLowerCase())
      );
      
      if (!seen.has(key)) {
        seen.set(key, attr);
      } else {
        // 如果已存在，但当前是常用属性且已存在的不是，则替换
        const existing = seen.get(key)!;
        const existingIsCommon = commonAttributeNames.some(
          (commonName) => 
            (existing.displayName || existing.name).toLowerCase().includes(commonName.toLowerCase()) ||
            existing.name.toLowerCase().includes(commonName.toLowerCase())
        );
        
        if (isCommon && !existingIsCommon) {
          seen.set(key, attr);
        }
      }
    });

    return Array.from(seen.values()).sort((a, b) => {
      // 常用属性排在前面
      const aIsCommon = commonAttributeNames.some(
        (name) => (a.displayName || a.name).toLowerCase().includes(name.toLowerCase())
      );
      const bIsCommon = commonAttributeNames.some(
        (name) => (b.displayName || b.name).toLowerCase().includes(name.toLowerCase())
      );
      
      if (aIsCommon && !bIsCommon) return -1;
      if (!aIsCommon && bIsCommon) return 1;
      
      // 然后按显示名称排序
      return (a.displayName || a.name).localeCompare(b.displayName || b.name);
    });
  }, [attributes]);

  // 创建属性
  const createMutation = useMutation({
    mutationFn: (data: CreateAttributeRequest) => attributeApi.createAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success(t('admin:attributes.createSuccess', { defaultValue: '属性创建成功' }));
      setShowCreateModal(false);
      setNewAttribute({
        name: '',
        displayName: '',
        type: AttributeType.SELECT,
        values: [],
        isRequired: false,
        displayOrder: 0,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || t('admin:attributes.createError', { defaultValue: '属性创建失败' }));
    },
  });

  // 初始化属性值（只在selectedAttributes改变时执行，避免无限循环）
  useEffect(() => {
    const initialValues: Record<string, string[]> = { ...attributeValues };
    let hasChanges = false;
    
    selectedAttributes.forEach((attrId) => {
      // 如果这个属性还没有值，才初始化
      if (!initialValues[attrId] || initialValues[attrId].length === 0) {
        const attr = uniqueAttributes.find((a) => a.id === attrId);
        if (attr && Array.isArray(attr.values) && attr.values.length > 0) {
          initialValues[attrId] = attr.values as string[];
          hasChanges = true;
        }
      }
    });
    
    // 移除已取消选择的属性的值
    Object.keys(initialValues).forEach((attrId) => {
      if (!selectedAttributes.includes(attrId)) {
        delete initialValues[attrId];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setAttributeValues(initialValues);
      // 同步到父组件
      Object.entries(initialValues).forEach(([attrId, values]) => {
        onAttributeValuesChange?.(attrId, values);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttributes]); // 只依赖 selectedAttributes，避免无限循环

  const handleSelectAttribute = (attributeId: string) => {
    if (selectedAttributes.includes(attributeId)) {
      onAttributesChange(selectedAttributes.filter((id) => id !== attributeId));
      const newValues = { ...attributeValues };
      delete newValues[attributeId];
      setAttributeValues(newValues);
      // 通知父组件移除该属性的值
      onAttributeValuesChange?.(attributeId, []);
    } else {
      onAttributesChange([...selectedAttributes, attributeId]);
      const attr = uniqueAttributes.find((a) => a.id === attributeId);
      if (attr && Array.isArray(attr.values) && attr.values.length > 0) {
        const newValues = {
          ...attributeValues,
          [attributeId]: attr.values as string[],
        };
        setAttributeValues(newValues);
        // 立即同步到父组件
        onAttributeValuesChange?.(attributeId, attr.values as string[]);
      } else {
        // 即使没有预设值，也要初始化空数组
        const newValues = {
          ...attributeValues,
          [attributeId]: [],
        };
        setAttributeValues(newValues);
        onAttributeValuesChange?.(attributeId, []);
      }
    }
  };

  const handleAddValue = (attributeId: string, value: string) => {
    if (!value.trim()) return;
    const currentValues = attributeValues[attributeId] || [];
    if (!currentValues.includes(value.trim())) {
      const newValues = {
        ...attributeValues,
        [attributeId]: [...currentValues, value.trim()],
      };
      setAttributeValues(newValues);
      onAttributeValuesChange?.(attributeId, newValues[attributeId]);
    }
  };

  const handleRemoveValue = (attributeId: string, value: string) => {
    const currentValues = attributeValues[attributeId] || [];
    const newValues = {
      ...attributeValues,
      [attributeId]: currentValues.filter((v) => v !== value),
    };
    setAttributeValues(newValues);
    onAttributeValuesChange?.(attributeId, newValues[attributeId]);
  };

  const handleCreateAttribute = () => {
    // 只验证必填字段：属性名称和属性类型
    if (!newAttribute.name || !newAttribute.name.trim()) {
      toast.error(t('admin:attributes.nameRequired', { defaultValue: '请输入属性名称' }));
      return;
    }

    if (!newAttribute.type) {
      toast.error(t('admin:attributes.typeRequired', { defaultValue: '请选择属性类型' }));
      return;
    }

    // values 是可选的，可以在创建后添加
    createMutation.mutate({
      name: newAttribute.name.trim(),
      displayName: newAttribute.displayName?.trim() || newAttribute.name.trim(),
      type: newAttribute.type,
      categoryId,
      values: (newAttribute.values as string[]) || [],
      isRequired: newAttribute.isRequired || false,
      displayOrder: newAttribute.displayOrder || 0,
    });
  };

  const selectedAttributesList = uniqueAttributes.filter((attr) => selectedAttributes.includes(attr.id));

  // 当选中的属性改变时，通知父组件
  useEffect(() => {
    if (onSelectedAttributesChange && selectedAttributesList.length > 0) {
      onSelectedAttributesChange(selectedAttributesList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttributes.join(',')]); // 使用字符串化的 selectedAttributes 作为依赖

  // 预设属性模板
  const attributeTemplates = [
    {
      name: t('admin:attributes.templates.clothing', { defaultValue: '服装标准' }),
      attributes: [
        { name: 'color', displayName: t('admin:attributes.color', { defaultValue: '颜色' }), type: AttributeType.COLOR, values: ['红色', '蓝色', '绿色', '黑色', '白色'] },
        { name: 'size', displayName: t('admin:attributes.size', { defaultValue: '尺寸' }), type: AttributeType.SELECT, values: ['S', 'M', 'L', 'XL', 'XXL'] },
      ],
    },
    {
      name: t('admin:attributes.templates.electronics', { defaultValue: '电子产品' }),
      attributes: [
        { name: 'configuration', displayName: t('admin:attributes.configuration', { defaultValue: '配置' }), type: AttributeType.SELECT, values: ['基础版', '标准版', '高级版', '旗舰版'] },
        { name: 'color', displayName: t('admin:attributes.color', { defaultValue: '颜色' }), type: AttributeType.COLOR, values: ['黑色', '白色', '银色', '金色'] },
      ],
    },
    {
      name: t('admin:attributes.templates.shoes', { defaultValue: '鞋类' }),
      attributes: [
        { name: 'size', displayName: t('admin:attributes.size', { defaultValue: '尺码' }), type: AttributeType.SELECT, values: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'] },
        { name: 'color', displayName: t('admin:attributes.color', { defaultValue: '颜色' }), type: AttributeType.COLOR, values: ['黑色', '白色', '棕色', '红色'] },
      ],
    },
  ];

  // 应用属性模板
  const handleApplyTemplate = async (template: typeof attributeTemplates[0]) => {
    try {
      // 先创建或获取模板中的属性
      const createdAttributeIds: string[] = [];
      
      for (const templateAttr of template.attributes) {
        // 检查属性是否已存在
        const existingAttr = uniqueAttributes.find(
          (a) => a.name.toLowerCase() === templateAttr.name.toLowerCase()
        );
        
        if (existingAttr) {
          createdAttributeIds.push(existingAttr.id);
          // 更新属性值（如果模板有预设值）
          if (templateAttr.values && templateAttr.values.length > 0) {
            // 这里可以更新属性的值，但为了简化，我们只选择现有属性
          }
        } else {
          // 创建新属性
          const newAttr = await attributeApi.createAttribute({
            name: templateAttr.name,
            displayName: templateAttr.displayName,
            type: templateAttr.type,
            categoryId,
            values: templateAttr.values || [],
            isRequired: false,
            displayOrder: 0,
          });
          createdAttributeIds.push(newAttr.id);
        }
      }
      
      // 选择创建的属性
      onAttributesChange([...selectedAttributes, ...createdAttributeIds]);
      
      // 设置属性值
      const newAttributeValues: Record<string, string[]> = { ...attributeValues };
      template.attributes.forEach((templateAttr, index) => {
        if (createdAttributeIds[index] && templateAttr.values) {
          newAttributeValues[createdAttributeIds[index]] = templateAttr.values;
        }
      });
      
      // 更新属性值（通过回调）
      Object.entries(newAttributeValues).forEach(([attrId, values]) => {
        onAttributeValuesChange?.(attrId, values);
      });
      
      toast.success(
        t('admin:attributes.templateApplied', {
          template: template.name,
          defaultValue: `已应用模板：${template.name}`,
        })
      );
    } catch (error: any) {
      toast.error(error.message || t('admin:attributes.templateError', { defaultValue: '应用模板失败' }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{t('admin:attributes.title', { defaultValue: '商品属性' })}</h3>
          <div
            className="group relative"
            title={t('admin:attributes.help', {
              defaultValue: '属性是商品的特性，如颜色、尺寸等。选择属性后，需要为每个属性添加可能的值。',
            })}
          >
            <Info size={16} className="text-text-tertiary cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {t('admin:attributes.help', {
                defaultValue: '属性是商品的特性，如颜色、尺寸等。选择属性后，需要为每个属性添加可能的值。',
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 属性模板选择 */}
          <div className="relative template-dropdown">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTemplates(!showTemplates)}
              aria-label={t('admin:attributes.applyTemplate', { defaultValue: '应用模板' })}
            >
              <Zap size={16} className="mr-2" />
              {t('admin:attributes.applyTemplate', { defaultValue: '应用模板' })}
              <ChevronDown size={14} className="ml-2" />
            </Button>
            
            {showTemplates && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-semibold text-text-secondary mb-2 px-2">
                    {t('admin:attributes.selectTemplate', { defaultValue: '选择模板' })}
                  </div>
                  {attributeTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleApplyTemplate(template);
                        setShowTemplates(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors"
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-text-secondary mt-1">
                        {template.attributes.map((a) => a.displayName).join(' + ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            aria-label={t('admin:attributes.create', { defaultValue: '创建属性' })}
          >
            <Plus size={16} className="mr-2" />
            {t('admin:attributes.create', { defaultValue: '创建属性' })}
          </Button>
        </div>
      </div>

      {/* 提示信息 */}
      {selectedAttributes.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">
                {t('admin:attributes.tip.title', { defaultValue: '快速开始' })}
              </p>
              <p className="text-blue-700">
                {t('admin:attributes.tip.content', {
                  defaultValue:
                    '建议先点击"应用模板"选择预设模板（如服装标准），或点击"创建属性"手动创建。选择属性后，记得为每个属性添加值（如颜色：红色、蓝色）。',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 属性选择列表 */}
      <Card className="p-4">
        {isLoading ? (
          <div className="text-center py-4 text-text-tertiary">
            {t('common:loading', { defaultValue: '加载中...' })}
          </div>
        ) : uniqueAttributes.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-text-tertiary mb-3">
              {t('admin:attributes.empty', { defaultValue: '暂无属性，请先创建' })}
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              variant="outline"
            >
              <Plus size={16} className="mr-2" />
              {t('admin:attributes.createFirst', { defaultValue: '创建第一个属性' })}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {uniqueAttributes.map((attr) => {
              const isSelected = selectedAttributes.includes(attr.id);
              return (
                <div
                  key={attr.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-brand-blue bg-brand-blue/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectAttribute(attr.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{attr.displayName || attr.name}</div>
                      <div className="text-sm text-text-secondary">
                        {t(`admin:attributes.types.${attr.type}`, { defaultValue: attr.type })}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectAttribute(attr.id)}
                      className="w-5 h-5"
                      aria-label={`选择 ${attr.displayName || attr.name}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 已选择属性的值配置 */}
      {selectedAttributesList.length > 0 && (
        <AttributeValuesEditor
          attributes={selectedAttributesList}
          attributeValues={attributeValues}
          onAddValue={handleAddValue}
          onRemoveValue={handleRemoveValue}
        />
      )}

      {/* 创建属性模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <Card className="w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {t('admin:attributes.create', { defaultValue: '创建属性' })}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label={t('common:close', { defaultValue: '关闭' })}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 提示信息 */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">
                    {t('admin:attributes.createTip.title', { defaultValue: '提示' })}
                  </p>
                  <p className="text-blue-700">
                    {t('admin:attributes.createTip.content', {
                      defaultValue:
                        '属性名称用于系统识别（如：color），显示名称用于前台展示（如：颜色）。创建后，记得在下方为属性添加值。',
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Input
                label={t('admin:attributes.name', { defaultValue: '属性名称' })}
                value={newAttribute.name || ''}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                required
                placeholder={t('admin:attributes.namePlaceholder', { defaultValue: '例如：color' })}
              />
              <Input
                label={t('admin:attributes.displayName', { defaultValue: '显示名称' })}
                value={newAttribute.displayName || ''}
                onChange={(e) => setNewAttribute({ ...newAttribute, displayName: e.target.value })}
                placeholder={t('admin:attributes.displayNamePlaceholder', { defaultValue: '例如：颜色（可选，默认使用属性名称）' })}
                helperText={t('admin:attributes.displayNameHelp', { defaultValue: '如果不填写，将使用属性名称作为显示名称' })}
              />
              <Select
                label={t('admin:attributes.type', { defaultValue: '属性类型' })}
                value={newAttribute.type || AttributeType.SELECT}
                onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value as AttributeType })}
                required
                options={Object.values(AttributeType).map((type) => ({
                  value: type,
                  label: t(`admin:attributes.types.${type}`, { defaultValue: type }),
                }))}
              />
              
              {/* 提示：属性值可以在创建后添加 */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-700">
                    <p>
                      {t('admin:attributes.valuesHint', {
                        defaultValue: '提示：属性值可以在创建属性后，在下方"已选择属性的值配置"区域中添加。',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateAttribute}
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending
                    ? t('common:loading', { defaultValue: '创建中...' })
                    : t('common:create', { defaultValue: '创建' })}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  {t('common:cancel', { defaultValue: '取消' })}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductAttributeManager;

