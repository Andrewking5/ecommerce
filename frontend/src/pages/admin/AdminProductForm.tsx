import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import Breadcrumb from '@/components/admin/Breadcrumb';
import ImageUpload from '@/components/admin/ImageUpload';
import ProductAttributeManager from '@/components/admin/ProductAttributeManager';
import ProductVariantGenerator from '@/components/admin/ProductVariantGenerator';
import VariantTableEditor from '@/components/admin/VariantTableEditor';
import VariantCSVImport from '@/components/admin/VariantCSVImport';
import ProductSpecifications from '@/components/admin/ProductSpecifications';
import VariantSetupGuide from '@/components/admin/VariantSetupGuide';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { productApi } from '@/services/products';
import { variantApi } from '@/services/variants';
import { Product } from '@/types/product';
import { ProductVariant, ProductAttribute } from '@/types/variant';
import toast from 'react-hot-toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

type Step = 'basic' | 'variants' | 'specifications' | 'review';

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    images: [] as string[],
    stock: '',
    specifications: {} as Record<string, any>,
    isActive: true,
    hasVariants: false,
    basePrice: '',
  });

  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedAttributeObjects, setSelectedAttributeObjects] = useState<ProductAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string[]>>({});
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [defaultStock, setDefaultStock] = useState<string>('0');
  const [showGuide, setShowGuide] = useState(false);

  // 键盘快捷键
  useKeyboardShortcuts(
    [
      {
        key: 's',
        ctrl: true,
        handler: (e) => {
          e.preventDefault();
          handleSubmit();
        },
        description: '保存商品',
      },
      {
        key: 'ArrowRight',
        ctrl: true,
        handler: (e) => {
          e.preventDefault();
          const steps: Step[] = ['basic', 'variants', 'specifications', 'review'];
          const currentIndex = steps.indexOf(currentStep);
          if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
          }
        },
        description: '下一步',
      },
      {
        key: 'ArrowLeft',
        ctrl: true,
        handler: (e) => {
          e.preventDefault();
          const steps: Step[] = ['basic', 'variants', 'specifications', 'review'];
          const currentIndex = steps.indexOf(currentStep);
          if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
          }
        },
        description: '上一步',
      },
    ],
    true
  );

  // 获取分类列表
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.getCategories(),
  });

  // 获取商品详情（编辑模式）
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.getProduct(id!),
    enabled: !!id,
  });

  // 使用独立的 hasVariants 状态，避免 formData 对象引用变化导致的问题
  const [hasVariants, setHasVariants] = useState(false);
  
  // 使用 ref 跟踪是否已初始化，避免无限循环
  const isInitializedRef = useRef<string | undefined>(undefined);
  const hasVariantsRef = useRef<boolean>(false);

  // 获取商品变体（编辑模式）- 使用稳定的查询条件
  const shouldFetchVariants = useMemo(() => {
    return !!id && (hasVariants || (product?.hasVariants ?? false));
  }, [id, hasVariants, product?.hasVariants]);

  const { data: productVariants = [] } = useQuery({
    queryKey: ['variants', id],
    queryFn: () => variantApi.getProductVariants(id!),
    enabled: shouldFetchVariants,
  });

  // 当商品ID改变时，重置初始化状态
  useEffect(() => {
    if (id !== isInitializedRef.current) {
      isInitializedRef.current = undefined;
      hasVariantsRef.current = false;
    }
  }, [id]);

  // 加载商品数据到表单 - 只初始化一次
  useEffect(() => {
    if (product && product.id && isInitializedRef.current !== product.id) {
      isInitializedRef.current = product.id;
      const productHasVariants = product.hasVariants || false;
      hasVariantsRef.current = productHasVariants;
      
      setFormData({
        name: product.name,
        description: product.description,
        price: String(product.price),
        categoryId: product.categoryId,
        images: product.images || [],
        stock: String(product.stock),
        specifications: product.specifications || {},
        isActive: product.isActive,
        hasVariants: productHasVariants,
        basePrice: String(product.basePrice || product.price),
      });
      
      // 同步 hasVariants 状态
      setHasVariants(productHasVariants);
    }
  }, [product?.id]); // 只依赖 product.id

  // 单独处理变体数据加载 - 只在数据真正变化时更新
  useEffect(() => {
    if (product?.id && isInitializedRef.current === product.id && productVariants.length > 0) {
      setVariants(productVariants);
    }
  }, [product?.id, productVariants.length]); // 只依赖长度，避免数组引用变化

  // 创建/更新商品
  const saveMutation = useMutation({
    mutationFn: (data: Partial<Product>) => {
      if (isEditing) {
        return productApi.updateProduct(id!, data);
      }
      return productApi.createProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        isEditing
          ? t('products.updateSuccess', { defaultValue: '商品更新成功' })
          : t('products.createSuccess', { defaultValue: '商品创建成功' })
      );
      navigate('/admin/products');
    },
    onError: (error: any) => {
      toast.error(error.message || t('products.saveError', { defaultValue: '保存失败' }));
    },
  });

  const handleNext = () => {
    if (currentStep === 'basic') {
      // 验证基本信息
      if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
        toast.error(t('products.validation.required', { defaultValue: '请填写所有必填字段' }));
        return;
      }
      setCurrentStep('variants');
    } else if (currentStep === 'variants') {
      // 如果启用了变体但没有变体，提示用户
      if (hasVariants && variants.length === 0) {
        toast.error(t('products.validation.noVariants', { defaultValue: '请先生成变体' }));
        return;
      }
      setCurrentStep('specifications');
    } else if (currentStep === 'specifications') {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'variants') {
      setCurrentStep('basic');
    } else if (currentStep === 'specifications') {
      setCurrentStep('variants');
    } else if (currentStep === 'review') {
      setCurrentStep('specifications');
    }
  };

  const handleSubmit = async () => {
    const productData: any = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      categoryId: formData.categoryId,
      images: formData.images,
      stock: Number(formData.stock) || 0,
      specifications: formData.specifications,
      isActive: formData.isActive,
      hasVariants: hasVariants && variants.length > 0, // 只有有变体时才设为true
      basePrice: hasVariants ? Number(formData.basePrice || formData.price) : Number(formData.price),
    };

    // 如果是新商品且需要生成变体，先创建商品，再生成变体
    if (!isEditing && hasVariants && selectedAttributes.length > 0 && Object.keys(attributeValues).length > 0) {
      // 先创建商品
      try {
        const savedProduct = await productApi.createProduct(productData);
        // 然后生成变体
        if (savedProduct.id) {
          const attributesForBulk = selectedAttributes
            .map((attrId: string) => {
              const values = attributeValues[attrId] || [];
              return values.length > 0 ? { attributeId: attrId, values } : null;
            })
            .filter(Boolean) as Array<{ attributeId: string; values: string[] }>;

          if (attributesForBulk.length > 0) {
            await variantApi.createVariantsBulk({
              productId: savedProduct.id,
              attributes: attributesForBulk,
              basePrice: Number(formData.basePrice || formData.price),
              defaultStock: Number(defaultStock) || 0,
            });
          }
        }
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success(t('products.createSuccess', { defaultValue: '商品创建成功' }));
        navigate('/admin/products');
      } catch (error: any) {
        toast.error(error.message || t('products.saveError', { defaultValue: '保存失败' }));
      }
    } else {
      // 普通保存
      saveMutation.mutate(productData);
    }
  };

  const steps = [
    { id: 'basic', label: t('products.steps.basic', { defaultValue: '基本信息' }) },
    { id: 'variants', label: t('products.steps.variants', { defaultValue: '变体设置' }) },
    { id: 'specifications', label: t('products.steps.specifications', { defaultValue: '规格参数' }) },
    { id: 'review', label: t('products.steps.review', { defaultValue: '预览确认' }) },
  ];

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Breadcrumb
        items={[
          { label: t('breadcrumb.dashboard', { defaultValue: 'Dashboard' }), path: '/admin' },
          { label: t('products.title', { defaultValue: 'Product Management' }), path: '/admin/products' },
          { label: isEditing ? t('products.edit', { defaultValue: 'Edit Product' }) : t('products.add', { defaultValue: 'Add Product' }) },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/products')}
            aria-label={t('common:back', { defaultValue: '返回' })}
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('common:back', { defaultValue: '返回' })}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {isEditing ? t('products.edit', { defaultValue: '编辑商品' }) : t('products.add', { defaultValue: '新增商品' })}
          </h1>
        </div>

        {/* 步骤指示器 */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepIndex = steps.findIndex((s) => s.id === currentStep);
              const isActive = step.id === currentStep;
              const isCompleted = index < stepIndex;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isActive
                          ? 'border-brand-blue bg-brand-blue text-white'
                          : isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check size={20} /> : index + 1}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        isActive ? 'text-brand-blue' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight
                      size={20}
                      className={`mx-2 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </Card>

        {/* 步骤内容 */}
        <Card className="p-6">
          {/* 步骤1: 基本信息 */}
          {currentStep === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('products.steps.basic', { defaultValue: '基本信息' })}
              </h2>

              <Input
                label={t('products.form.name', { defaultValue: '商品名称' })}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder={t('products.form.namePlaceholder', { defaultValue: 'Enter product name' })}
              />

              <Textarea
                label={t('products.form.description', { defaultValue: '商品描述' })}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                placeholder={t('products.form.descriptionPlaceholder', { defaultValue: 'Describe product features, functions, etc.' })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('products.form.price', { defaultValue: '价格' })}
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />

                <Input
                  label={t('products.form.stock', { defaultValue: '库存' })}
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  min="0"
                />
              </div>

              <Select
                label={t('products.form.category', { defaultValue: '分类' })}
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                options={[
                  { value: '', label: t('products.form.selectCategory', { defaultValue: 'Select Category' }) },
                  ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t('products.form.images', { defaultValue: '商品图片' })}
                </label>
                <ImageUpload
                  images={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                  maxImages={10}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-text-secondary">
                  {t('products.form.publishImmediately', { defaultValue: '立即发布商品' })}
                </label>
              </div>
            </div>
          )}

          {/* 步骤2: 变体设置 */}
          {currentStep === 'variants' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {t('products.steps.variants', { defaultValue: '变体设置' })}
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowGuide(!showGuide)}
                  aria-label={t('admin:variants.showGuide', { defaultValue: '显示指南' })}
                >
                  <HelpCircle size={16} className="mr-2" />
                  {showGuide
                    ? t('admin:variants.hideGuide', { defaultValue: '隐藏指南' })
                    : t('admin:variants.showGuide', { defaultValue: '使用指南' })}
                </Button>
              </div>

              {/* 使用指南 */}
              {showGuide && <VariantSetupGuide onClose={() => setShowGuide(false)} />}

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="hasVariants"
                  checked={hasVariants}
                  onChange={(e) => {
                    const newHasVariants = e.target.checked;
                    setHasVariants(newHasVariants);
                    setFormData({ ...formData, hasVariants: newHasVariants });
                    if (!newHasVariants) {
                      setVariants([]);
                      setSelectedAttributes([]);
                      setAttributeValues({});
                    }
                  }}
                  className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                />
                <label htmlFor="hasVariants" className="ml-3 text-base font-medium text-text-primary">
                  {t('products.form.enableVariants', { defaultValue: '启用商品变体（如：颜色、尺寸等）' })}
                </label>
              </div>

              {hasVariants && (
                <div className="space-y-6">
                  <ProductAttributeManager
                    categoryId={formData.categoryId}
                    selectedAttributes={selectedAttributes}
                    onAttributesChange={setSelectedAttributes}
                    onAttributeValuesChange={(attributeId, values) => {
                      setAttributeValues((prev) => ({ ...prev, [attributeId]: values }));
                    }}
                    onSelectedAttributesChange={(selectedAttrs) => {
                      // 这个回调会传递选中的属性对象列表
                      setSelectedAttributeObjects(selectedAttrs);
                    }}
                  />

                  {/* 变体生成器：当选择了属性时显示 */}
                  {selectedAttributes.length > 0 && (
                    <ProductVariantGenerator
                      productId={id || 'new'}
                      attributes={selectedAttributeObjects}
                      attributeValues={attributeValues}
                      categoryId={formData.categoryId}
                      onVariantsGenerated={async (generatedData?: { basePrice?: string; defaultStock?: string }) => {
                        if (generatedData) {
                          if (generatedData.basePrice) {
                            setFormData({ ...formData, basePrice: generatedData.basePrice });
                          }
                          if (generatedData.defaultStock) {
                            setDefaultStock(generatedData.defaultStock);
                          }
                        }
                        if (id) {
                          queryClient.invalidateQueries({ queryKey: ['variants', id] });
                          const newVariants = await variantApi.getProductVariants(id);
                          setVariants(newVariants);
                        }
                      }}
                    />
                  )}

                  {/* CSV 导入（仅在编辑模式且有变体时显示） */}
                  {id && variants.length > 0 && (
                    <VariantCSVImport
                      productId={id}
                      categoryId={formData.categoryId}
                      onImportComplete={async () => {
                        queryClient.invalidateQueries({ queryKey: ['variants', id] });
                        const newVariants = await variantApi.getProductVariants(id);
                        setVariants(newVariants);
                      }}
                    />
                  )}

                  {variants.length > 0 && (
                    <VariantTableEditor
                      productId={id || 'new'}
                      variants={variants}
                      onVariantUpdated={() => {
                        if (id) {
                          queryClient.invalidateQueries({ queryKey: ['variants', id] });
                        }
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 步骤3: 规格参数 */}
          {currentStep === 'specifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('products.steps.specifications', { defaultValue: '规格参数' })}
              </h2>
              <ProductSpecifications
                specifications={formData.specifications}
                onChange={(specs) => setFormData({ ...formData, specifications: specs })}
              />
            </div>
          )}

          {/* 步骤4: 预览确认 */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('products.steps.review', { defaultValue: '预览确认' })}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t('products.form.name', { defaultValue: '商品名称' })}</h3>
                  <p className="text-text-secondary">{formData.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t('products.form.description', { defaultValue: '商品描述' })}</h3>
                  <p className="text-text-secondary">{formData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">{t('products.form.price', { defaultValue: '价格' })}</h3>
                    <p className="text-text-secondary">${Number(formData.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">{t('products.form.stock', { defaultValue: '库存' })}</h3>
                    <p className="text-text-secondary">{formData.stock}</p>
                  </div>
                </div>
                {hasVariants && (
                  <div>
                    <h3 className="font-medium mb-2">
                      {t('products.variants.count', { count: variants.length, defaultValue: `变体数量: ${variants.length}` })}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 'basic' ? () => navigate('/admin/products') : handleBack}
              disabled={saveMutation.isPending}
            >
              {currentStep === 'basic' ? t('common:cancel', { defaultValue: '取消' }) : t('common:back', { defaultValue: '上一步' })}
            </Button>

            <div className="flex gap-2">
              {currentStep !== 'review' ? (
                <Button onClick={handleNext} disabled={saveMutation.isPending}>
                  {t('common:next', { defaultValue: '下一步' })}
                  <ChevronRight size={20} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                  {saveMutation.isPending
                    ? t('common:saving', { defaultValue: '保存中...' })
                    : isEditing
                    ? t('common:update', { defaultValue: '更新商品' })
                    : t('common:create', { defaultValue: '创建商品' })}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminProductForm;

