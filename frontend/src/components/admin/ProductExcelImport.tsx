import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2, HelpCircle, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { productApi } from '@/services/products';
import { attributeApi } from '@/services/attributes';
import { variantApi } from '@/services/variants';
import { Category, Product } from '@/types/product';
import { ProductAttribute } from '@/types/variant';
import { normalizeStock } from '@/utils/productHelpers';
import toast from 'react-hot-toast';

interface ProductExcelImportProps {
  categories: Category[];
  onClose?: () => void;
}

// 类型定义已移除，因为未在代码中使用

const ProductExcelImport: React.FC<ProductExcelImportProps> = ({ categories, onClose }) => {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [autoCreateAttributes, setAutoCreateAttributes] = useState(true); // 是否自动创建新属性
  const [newAttributes, setNewAttributes] = useState<Array<{
    name: string;
    displayName: string;
    type: string;
    categoryId?: string;
    values: string[];
    isVariant: boolean; // 是否为变体属性
  }>>([]);
  // 存储导入后的错误信息（从后端返回的）
  const [importErrors, setImportErrors] = useState<Map<number, string[]>>(new Map());
  // 存储商品索引到Excel行号的映射关系
  const productIndexToExcelRowsRef = useRef<Map<number, number[]>>(new Map());

  // 获取所有分类的所有属性（用于模板生成）
  const { data: allAttributes = [] } = useQuery({
    queryKey: ['attributes', 'all'],
    queryFn: () => attributeApi.getAttributes({}),
  });

  // 获取数据库中所有商品名称（用于验证重复）
  // 使用 useQuery 的 enabled 选项，只在需要验证时才获取
  const { data: existingProducts, isLoading: isLoadingExistingProducts } = useQuery({
    queryKey: ['admin-products', 'all-names'],
    queryFn: async () => {
      try {
        // 获取所有商品（只获取名称，用于验证）
        const allProducts: Product[] = [];
        let page = 1;
        let hasMore = true;
        const maxPages = 100; // 最多获取100页，防止无限循环
        
        while (hasMore && page <= maxPages) {
          const response = await productApi.getProducts({
            page,
            limit: 100, // 每次获取100个
            isActive: true, // 只获取活跃的商品，排除已软删除的商品
          });
          allProducts.push(...response.products);
          hasMore = response.products.length === 100;
          page++;
        }
        
        console.log(`📋 [验证] 获取到 ${allProducts.length} 个现有活跃商品名称用于验证（已排除软删除的商品）`);
        return allProducts.map(p => p.name.trim().toLowerCase());
      } catch (error) {
        console.error('获取现有商品名称失败:', error);
        // 如果获取失败，返回空数组，不阻止导入（后端也会检查）
        return [];
      }
    },
    enabled: showPreview && previewData.length > 0, // 只在预览时获取
    staleTime: 60000, // 1分钟内不重新获取
    retry: 1, // 只重试1次
  });

  // 批量创建商品
  const importMutation = useMutation({
    mutationFn: async (data: { products: any[]; variants?: any[] }) => {
      const results = {
        products: [] as Product[],
        variants: [] as any[],
        failed: [] as Array<{ index: number; data: any; error: string }>,
      };

      // 先创建所有商品
      if (data.products.length > 0) {
        const bulkResult = await productApi.createProductsBulk(data.products);
        results.products = bulkResult.success;
        results.failed.push(...bulkResult.failed);
      }

      // 然后为有变体的商品创建变体（使用批量直接创建 API）
      if (data.variants && data.variants.length > 0) {
        for (const variantGroup of data.variants) {
          const product = results.products.find(p => p.name === variantGroup.productName);
          if (product && variantGroup.variants.length > 0) {
            try {
              // 转换变体数据格式，确保 SKU 不为空
              const variantsToCreate = variantGroup.variants.map((variant: any, index: number) => {
                // 确保 SKU 不为空
                let sku = variant.sku;
                if (!sku || String(sku).trim() === '') {
                  // 如果SKU为空，生成一个基于商品ID和属性ID+值的唯一SKU
                  const attrPairs = variant.attributes 
                    ? Object.entries(variant.attributes)
                        .map(([attrId, value]) => {
                          const attrIdShort = attrId.substring(0, 8).replace(/[^a-zA-Z0-9]/g, '');
                          const valueSlug = String(value)
                            .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
                            .toLowerCase()
                            .substring(0, 20);
                          return `${attrIdShort}-${valueSlug}`;
                        })
                        .filter(pair => pair && pair !== '-')
                        .join('-')
                    : '';
                  const timestamp = Date.now().toString(36);
                  const randomSuffix = Math.random().toString(36).substring(2, 6);
                  sku = `${product.id}-${attrPairs || 'default'}-${index}-${timestamp}-${randomSuffix}`;
                  
                  // 限制SKU长度
                  if (sku.length > 100) {
                    sku = sku.substring(0, 100);
                  }
                }
                sku = String(sku).trim();

                // 转换属性格式
                const variantAttributes = Object.entries(variant.attributes || {}).map(([attributeId, value]) => ({
                  attributeId,
                  value: String(value),
                }));

                // 使用统一的库存处理函数
                const stock = normalizeStock(variant.stock);

                return {
                  sku,
                  price: Number(variant.price),
                  stock: stock,
                  images: variant.images || [],
                  isDefault: index === 0 && variant.isDefault !== false, // 第一个变体设为默认（如果没有明确指定）
                  isActive: variant.isActive !== false,
                  attributes: variantAttributes,
                };
              });

              console.log(`🔑 [导入] 准备批量创建变体，商品: ${product.name}, 变体数量: ${variantsToCreate.length}`);

              // 使用批量直接创建变体 API
              const bulkResult = await variantApi.createVariantsDirectBulk({
                productId: product.id,
                variants: variantsToCreate,
              });

              // 处理结果
              results.variants.push(...bulkResult.success);
              
              // 将失败的变体添加到失败列表
              bulkResult.failed.forEach((failed) => {
                results.failed.push({
                  index: failed.index,
                  data: { productName: variantGroup.productName, sku: failed.sku },
                  error: failed.error,
                });
              });

              console.log(`✅ [导入] 批量创建变体完成，商品: ${product.name}, 成功: ${bulkResult.summary.success}, 失败: ${bulkResult.summary.failed}`);
            } catch (error: any) {
              console.error(`❌ [导入] 批量创建变体失败，商品: ${product.name}:`, error);
              const errorMessage = error?.response?.data?.message || error?.message || '批量创建变体失败';
              
              // 将所有变体标记为失败
              variantGroup.variants.forEach((variant: any) => {
                results.failed.push({
                  index: -1,
                  data: { productName: variantGroup.productName, sku: variant.sku || '' },
                  error: errorMessage,
                });
              });
            }
          }
        }
      }

      return {
        success: results.products,
        variants: results.variants,
        failed: results.failed,
        summary: {
          total: data.products.length,
          success: results.products.length,
          failed: results.failed.length,
        },
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products', 'all-names'] }); // 刷新商品名称列表
      
      const { summary, failed } = data;
      
      // 处理错误信息显示 - 确保显示中文而不是国际化key
      const formatError = (error: string): string => {
        // 如果错误信息包含国际化key，转换为中文
        if (error.includes('errors.nameAlreadyExists')) {
          const match = error.match(/商品名称\s*"([^"]+)"\s*已存在/);
          if (match) {
            return `商品名称 "${match[1]}" 已存在`;
          }
          return '商品名称已存在';
        }
        if (error.includes('errors.')) {
          // 移除国际化key前缀，显示实际错误
          return error.replace(/errors\./g, '').replace(/products:/g, '').replace(/categories:/g, '');
        }
        return error;
      };
      
      if (summary.failed === 0) {
        toast.success(t('products.import.success', { 
          count: summary.success,
          defaultValue: `成功导入 ${summary.success} 个商品` 
        }));
        // 清除导入错误
        setImportErrors(new Map());
        setPreviewData([]);
        setShowPreview(false);
        if (onClose) onClose();
      } else {
        // 有失败的情况 - 不关闭预览，让用户看到错误
        toast.error(
          `导入完成：成功 ${summary.success} 个，失败 ${summary.failed} 个。请查看下方预览表格中的错误标记。`,
          { duration: 8000 }
        );
        
        // 将后端返回的错误信息同步到预览表格中
        const newImportErrors = new Map<number, string[]>();
        if (failed.length > 0) {
          // 使用保存的映射关系
          const currentMapping = productIndexToExcelRowsRef.current;
          
          console.log(`🔍 [错误映射] 开始映射 ${failed.length} 个错误，映射表大小: ${currentMapping.size}`);
          console.log(`🔍 [错误映射] 映射表内容:`, Array.from(currentMapping.entries()));
          
          failed.forEach(f => {
            // 后端返回的 index 是商品在 productsData 数组中的位置（i + 1）
            // 需要转换为 Excel 行号，然后映射到 previewData 索引
            const productIndex = f.index > 0 ? f.index - 1 : -1; // 转换为商品数组索引（从0开始）
            
            console.log(`🔍 [错误映射] 处理错误: 后端index=${f.index}, 商品索引=${productIndex}, 商品名称="${f.data?.name || '未知'}"`);
            
            if (productIndex >= 0 && currentMapping.has(productIndex)) {
              // 获取该商品对应的所有Excel行号
              const excelRowNumbers = currentMapping.get(productIndex) || [];
              
              console.log(`🔍 [错误映射] 商品索引 ${productIndex} 对应的Excel行号:`, excelRowNumbers);
              
              // 将错误映射到所有对应的Excel行
              excelRowNumbers.forEach(excelRowNumber => {
                const previewDataIndex = excelRowNumber - 2; // Excel行号转previewData索引（-2因为第1行是表头）
                
                if (previewDataIndex >= 0 && previewDataIndex < previewData.length) {
                  const errorMsg = formatError(f.error);
                  if (!newImportErrors.has(previewDataIndex)) {
                    newImportErrors.set(previewDataIndex, []);
                  }
                  newImportErrors.get(previewDataIndex)!.push(errorMsg);
                  
                  console.log(`✅ [错误映射] 商品索引 ${productIndex} (商品名称: "${f.data?.name || '未知'}") -> Excel行号 ${excelRowNumber} -> previewData索引 ${previewDataIndex}, 该行商品名称: "${previewData[previewDataIndex]?.['商品名称'] || '未知'}"`);
                } else {
                  console.warn(`⚠️ [导入错误] Excel行号 ${excelRowNumber} 超出范围，previewData.length=${previewData.length}`);
                }
              });
            } else {
              console.warn(`⚠️ [导入错误] 无法找到商品索引 ${productIndex} 的Excel行号映射，商品名称: "${f.data?.name || '未知'}"`);
              console.warn(`⚠️ [导入错误] 可用的商品索引:`, Array.from(currentMapping.keys()));
            }
          });
        }
        setImportErrors(newImportErrors);
        
        // 不自动关闭预览，让用户看到错误并修复
        // setPreviewData([]);
        // setShowPreview(false);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('products.import.error', { defaultValue: '导入失败' }));
    },
  });

  // 生成统一模板（自动识别是否有变体）
  const downloadTemplate = () => {
    // 检查是否有分类
    if (!categories || categories.length === 0) {
      toast.error(t('products.import.noCategories', { 
        defaultValue: '请先创建至少一个分类，然后再下载模板' 
      }));
      return;
    }

    const wb = XLSX.utils.book_new();
    
    // 获取所有变体属性（用于变体的属性）和规格字段（商品固定属性）
    // 由于不同分类可能有不同属性，我们收集所有可能的属性
    const variantAttributesMap = new Map<string, { name: string; displayName: string; values: any[]; type: string }>();
    const specFieldsMap = new Map<string, { name: string; displayName: string }>();
    
    if (allAttributes && allAttributes.length > 0) {
      // 按 displayOrder 排序
      const sortedAttributes = [...allAttributes].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      sortedAttributes.forEach(attr => {
        const attrName = attr.displayName || attr.name;
        const attrValues = Array.isArray(attr.values) ? attr.values : [];
        
        // 变体属性（COLOR、SELECT、IMAGE 类型）- 用于区分变体
        if (attr.type === 'COLOR' || attr.type === 'SELECT' || attr.type === 'IMAGE') {
          if (!variantAttributesMap.has(attr.name)) {
            variantAttributesMap.set(attr.name, {
              name: attr.name,
              displayName: attrName,
              values: attrValues,
              type: attr.type,
            });
          }
        } else {
          // 规格字段（TEXT 或 NUMBER 类型）- 商品固定属性
          if (!specFieldsMap.has(attr.name)) {
            specFieldsMap.set(attr.name, {
              name: attr.name,
              displayName: attrName,
            });
          }
        }
      });
    }
    
    const variantAttributes = Array.from(variantAttributesMap.values());
    const specFields = Array.from(specFieldsMap.values());
    
    // 如果没有属性，使用通用示例
    if (variantAttributes.length === 0) {
      variantAttributes.push({ name: 'color', displayName: '颜色', values: ['红色', '蓝色', '绿色'], type: 'SELECT' });
      variantAttributes.push({ name: 'size', displayName: '尺寸', values: ['大', '中', '小'], type: 'SELECT' });
    }

    const categoryNames = categories.map(c => c.name);
    const firstCategoryName = categories[0]?.name || '电子产品';

    // ========== 第一步：创建填写说明工作表（第一页） ==========
    const instructionRows: any[] = [];
    
    // 标题
    instructionRows.push({ A: '商品批量导入填写说明', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    
    // 核心规则
    instructionRows.push({ A: '【核心规则】', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 相同商品名称的多行 = 同一商品的不同变体', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 不同商品名称的行 = 不同的商品', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    
    // 填写方式 - 有变体的商品
    instructionRows.push({ A: '【有变体的商品填写方式】', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 第一行：填写完整的商品信息（商品名称、描述、价格、分类、库存等）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 后续行：商品名称必须与第一行完全相同', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 后续行：只需填写价格、库存和变体属性（见下方属性列表）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 后续行的描述、分类等可以留空，会自动使用第一行的信息', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    
    // 填写方式 - 无变体的商品
    instructionRows.push({ A: '【无变体的商品填写方式】', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 每行代表一个独立的商品', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 每行都需要填写完整的商品信息', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 商品名称必须唯一（不能与其他商品重复，也不能与数据库中已有商品重复）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 变体属性列可以留空', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    
    // 字段说明
    instructionRows.push({ A: '【字段说明】', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 商品名称：必填，商品的名称', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 商品描述：必填（有变体商品只需第一行填写）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 价格：必填，商品价格（数字）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 分类：必填，填写分类名称、slug 或 ID（有变体商品只需第一行填写）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: `  可选分类：${categoryNames.join('、')}`, B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '  注意：分类支持三种方式：分类名称、分类 slug 或分类 ID', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 库存：必填，商品库存数量（数字）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 图片URL：可选，商品图片链接，多个用逗号分隔', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '• 是否启用：可选，true/false 或 是/否 或 1/0，默认 true', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    
    // 变体属性说明
    if (variantAttributes.length > 0) {
      instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
      instructionRows.push({ A: '【变体属性字段】（用于区分同一商品的不同变体）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
      variantAttributes.forEach(attr => {
        const valuesStr = Array.isArray(attr.values) && attr.values.length > 0 
          ? `可选值：${attr.values.slice(0, 5).join('、')}${attr.values.length > 5 ? '...' : ''}`
          : '可自定义填写';
        instructionRows.push({ 
          A: `• ${attr.displayName}：${valuesStr}`, 
          B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' 
        });
      });
    }
    
    // 规格字段说明
    if (specFields.length > 0) {
      instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
      instructionRows.push({ A: '【规格字段】（商品固定属性，所有变体共享）', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
      specFields.forEach(field => {
        instructionRows.push({ 
          A: `• ${field.displayName}：可选，商品规格信息`, 
          B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' 
        });
      });
    }
    
    instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '【填写示例】', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    
    // 构建表头行
    const headerRow: any = {
      A: '商品名称',
      B: '商品描述',
      C: '价格',
      D: '分类',
      E: '库存',
      F: '图片URL',
      G: '是否启用',
    };
    let colIndex = 7; // H, I, J...
    variantAttributes.forEach(attr => {
      headerRow[String.fromCharCode(65 + colIndex)] = attr.displayName;
      colIndex++;
    });
    specFields.forEach(field => {
      headerRow[String.fromCharCode(65 + colIndex)] = field.displayName;
      colIndex++;
    });
    instructionRows.push(headerRow);
    
    // 示例行1：有变体商品的第一行
    if (variantAttributes.length > 0) {
      const exampleRow1: any = {
        A: 'T恤',
        B: '这是一件有多个变体的T恤',
        C: 99.99,
        D: firstCategoryName,
        E: 100,
        F: 'https://example.com/image.jpg',
        G: true,
      };
      colIndex = 7;
      variantAttributes.forEach((attr) => {
        const value = Array.isArray(attr.values) && attr.values.length > 0 ? attr.values[0] : '示例值1';
        exampleRow1[String.fromCharCode(65 + colIndex)] = value;
        colIndex++;
      });
      specFields.forEach(() => {
        exampleRow1[String.fromCharCode(65 + colIndex)] = '示例规格';
        colIndex++;
      });
      instructionRows.push(exampleRow1);
      
      // 示例行2：有变体商品的后续行
      const exampleRow2: any = {
        A: 'T恤',
        B: '(留空)',
        C: 99.99,
        D: '(留空)',
        E: 80,
        F: '(留空)',
        G: '(留空)',
      };
      colIndex = 7;
      variantAttributes.forEach((attr) => {
        const value = Array.isArray(attr.values) && attr.values.length > 1 ? attr.values[1] : '示例值2';
        exampleRow2[String.fromCharCode(65 + colIndex)] = value;
        colIndex++;
      });
      specFields.forEach(() => {
        exampleRow2[String.fromCharCode(65 + colIndex)] = '(留空)';
        colIndex++;
      });
      instructionRows.push(exampleRow2);
      
      instructionRows.push({ A: '↑ 上面2行表示：1个商品"T恤"，有2个变体', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
      instructionRows.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    }
    
    // 示例行3：无变体商品
    const exampleRow3: any = {
      A: '手机',
      B: '这是一款手机，没有变体',
      C: 2999.99,
      D: firstCategoryName,
      E: 50,
      F: 'https://example.com/phone.jpg',
      G: true,
    };
    colIndex = 7;
    variantAttributes.forEach(() => {
      exampleRow3[String.fromCharCode(65 + colIndex)] = '(留空)';
      colIndex++;
    });
    specFields.forEach(() => {
      exampleRow3[String.fromCharCode(65 + colIndex)] = '示例规格';
      colIndex++;
    });
    instructionRows.push(exampleRow3);
    instructionRows.push({ A: '↑ 上面1行表示：1个独立商品"手机"', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '' });
    
    // 创建说明工作表 - 转换为数组格式
    const instructionArray = instructionRows.map(row => {
      const rowArray: any[] = [];
      for (let i = 0; i < 20; i++) {
        const col = String.fromCharCode(65 + i);
        rowArray.push(row[col] || '');
      }
      return rowArray;
    });
    
    const instructionWs = XLSX.utils.aoa_to_sheet(instructionArray);
    
    // 设置说明工作表列宽（优化）
    instructionWs['!cols'] = [
      { wch: 60 }, // A列：说明内容（加宽以便阅读）
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    ];
    
    // 设置说明工作表行高（让内容更易读）
    if (!instructionWs['!rows']) {
      instructionWs['!rows'] = [];
    }
    instructionArray.forEach((row, rowIndex) => {
      // 标题行和重要说明行设置更大的行高
      const isTitle = row[0] && (
        String(row[0]).includes('【') || 
        String(row[0]).includes('===') ||
        String(row[0]).includes('商品名称')
      );
      const rows = instructionWs['!rows'];
      if (rows) {
        rows[rowIndex] = { hpt: isTitle ? 18 : 15 };
      }
    });
    
    // 尝试设置说明工作表的样式
    try {
      instructionArray.forEach((row, rowIndex) => {
        if (row[0]) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
          if (instructionWs[cellAddress]) {
            const cellValue = String(row[0]);
            // 标题行加粗
            if (cellValue.includes('【') || cellValue.includes('===')) {
              instructionWs[cellAddress].s = {
                font: { bold: true, sz: 12, color: { rgb: '1F4E78' } },
                alignment: { vertical: 'top', wrapText: true },
              };
            } else if (cellValue.includes('商品名称')) {
              // 表头行
              instructionWs[cellAddress].s = {
                font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '4472C4' } },
                alignment: { horizontal: 'center', vertical: 'center' },
              };
            } else {
              instructionWs[cellAddress].s = {
                font: { sz: 10 },
                alignment: { vertical: 'top', wrapText: true },
              };
            }
          }
        }
      });
    } catch (error) {
      console.warn('无法设置说明工作表样式，但不影响功能', error);
    }
    
    // 将说明工作表添加到工作簿（第一页）
    XLSX.utils.book_append_sheet(wb, instructionWs, '填写说明');

    // ========== 第二步：创建商品数据工作表（只有表头，空的） ==========
    // 优化列顺序：必填字段在前，可选字段在后
    const headerData: any = {
      商品名称: '',      // 必填
      商品描述: '',      // 必填（有变体只需第一行）
      分类: '',          // 必填，下拉选择
      价格: '',          // 必填
      库存: '',          // 必填
      图片URL: '',       // 可选
      是否启用: '',      // 可选
    };
    
    // 添加变体属性列（在基础字段之后）
    variantAttributes.forEach(attr => {
      headerData[attr.displayName] = '';
    });
    
    // 添加规格字段列（在最后）
    specFields.forEach(field => {
      headerData[field.displayName] = '';
    });
    
    // 只创建表头，不添加数据行
    const dataWs = XLSX.utils.json_to_sheet([headerData]);
    
    // 获取列索引映射
    const columnKeys = Object.keys(headerData);
    const getColumnIndex = (key: string) => {
      const index = columnKeys.indexOf(key);
      return index >= 0 ? String.fromCharCode(65 + index) : null;
    };
    
    // 设置商品数据工作表列宽（优化宽度）
    const colWidths = columnKeys.map((key) => {
      // 基础字段设置合适的宽度
      if (key === '商品名称') return { wch: 30 };
      if (key === '商品描述') return { wch: 50 };
      if (key === '分类') return { wch: 18 };
      if (key === '价格') return { wch: 14 };
      if (key === '库存') return { wch: 12 };
      if (key === '图片URL') return { wch: 60 };
      if (key === '是否启用') return { wch: 14 };
      // 变体属性和规格字段
      return { wch: 18 };
    });
    dataWs['!cols'] = colWidths;
    
    // 设置行高（表头行）
    if (!dataWs['!rows']) {
      dataWs['!rows'] = [];
    }
    dataWs['!rows'][0] = { hpt: 20 }; // 表头行高20
    
    // 冻结第一行（表头）
    dataWs['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };
    
    // 设置自动筛选（如果XLSX支持）
    if (dataWs['!ref']) {
      dataWs['!autofilter'] = { ref: dataWs['!ref'] };
    }
    
    // 尝试设置表头样式（XLSX对样式的支持有限，但可以尝试）
    try {
      const headerRow = 0;
      columnKeys.forEach((key, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: colIndex });
        if (!dataWs[cellAddress]) {
          dataWs[cellAddress] = { v: key, t: 's' };
        }
        // 尝试设置样式（XLSX可能不支持，但不影响功能）
        if (dataWs[cellAddress]) {
          dataWs[cellAddress].s = {
            font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4472C4' } }, // 蓝色背景
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          };
        }
      });
    } catch (error) {
      console.warn('无法设置表头样式，但不影响功能', error);
    }
    
    // 设置数据行的数字格式
    try {
      const priceColIndex = getColumnIndex('价格');
      const stockColIndex = getColumnIndex('库存');
      
      // 为价格列设置数字格式（从第2行开始）
      if (priceColIndex) {
        for (let row = 1; row <= 1000; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: columnKeys.indexOf('价格') });
          if (!dataWs[cellAddress]) {
            dataWs[cellAddress] = { v: '', t: 'n', z: '#,##0.00' }; // 数字格式，保留2位小数
          } else if (dataWs[cellAddress].v !== undefined) {
            dataWs[cellAddress].z = '#,##0.00';
          }
        }
      }
      
      // 为库存列设置整数格式
      if (stockColIndex) {
        for (let row = 1; row <= 1000; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: columnKeys.indexOf('库存') });
          if (!dataWs[cellAddress]) {
            dataWs[cellAddress] = { v: '', t: 'n', z: '0' }; // 整数格式
          } else if (dataWs[cellAddress].v !== undefined) {
            dataWs[cellAddress].z = '0';
          }
        }
      }
    } catch (error) {
      console.warn('无法设置数字格式，但不影响功能', error);
    }
    
    // 为分类列（D列）添加数据验证（下拉列表）
    // 注意：XLSX库对数据验证的支持有限，这里尝试添加，如果不行至少说明中已告知用户
    try {
      // 创建分类列表工作表（用于数据验证引用）
      const categoryListWs = XLSX.utils.aoa_to_sheet([categoryNames]);
      XLSX.utils.book_append_sheet(wb, categoryListWs, '_Categories');
      
      // 尝试添加数据验证（分类列，从第2行开始）
      const categoryColIndex = getColumnIndex('分类');
      if (categoryColIndex) {
        const maxRow = 10000; // 设置最大行数
        const categoryFormula = `_Categories!$A$1:$A$${categoryNames.length}`;
        
        // 使用XLSX的数据验证格式（Excel格式）
        const dataValidation = {
          sqref: `${categoryColIndex}2:${categoryColIndex}${maxRow}`, // 分类列从第2行到最大行
          type: 'list',
          formula1: categoryFormula,
          showDropDown: true,
          showInputMessage: true,
          promptTitle: '选择分类',
          prompt: `请从下拉列表中选择一个分类：${categoryNames.join('、')}`,
          showError: true,
          errorStyle: 'stop',
          errorTitle: '无效的分类',
          error: `请输入以下分类之一：${categoryNames.join('、')}`,
        };
        
        // 设置数据验证（XLSX可能不支持，但至少尝试）
        if (!dataWs['!dataValidation']) {
          dataWs['!dataValidation'] = [];
        }
        dataWs['!dataValidation'].push(dataValidation);
      }
      
      // 为"是否启用"列添加数据验证
      const enabledColIndex = getColumnIndex('是否启用');
      if (enabledColIndex) {
        const maxRow = 10000;
        const enabledValidation = {
          sqref: `${enabledColIndex}2:${enabledColIndex}${maxRow}`,
          type: 'list',
          formula1: '"是,否,true,false,1,0"',
          showDropDown: true,
          showInputMessage: true,
          promptTitle: '是否启用',
          prompt: '请输入：是/否 或 true/false 或 1/0',
          showError: true,
          errorStyle: 'stop',
          errorTitle: '无效的值',
          error: '请输入：是/否 或 true/false 或 1/0',
        };
        
        if (!dataWs['!dataValidation']) {
          dataWs['!dataValidation'] = [];
        }
        dataWs['!dataValidation'].push(enabledValidation);
      }
    } catch (error) {
      console.warn('无法添加数据验证，但模板仍然可用。用户可以从说明中查看可用分类。', error);
    }
    
    // 将商品数据工作表添加到工作簿（第二页）
    XLSX.utils.book_append_sheet(wb, dataWs, '商品数据');

    XLSX.writeFile(wb, '商品导入模板.xlsx');
    toast.success(t('products.import.templateDownloaded', { defaultValue: '模板下载成功' }));
  };

  // 解析 Excel 文件
  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 查找"商品数据"工作表，如果没有则使用第一个工作表
        let dataSheetName: string | undefined = workbook.SheetNames.find(name => name === '商品数据');
        if (!dataSheetName) {
          // 如果找不到"商品数据"，跳过"填写说明"工作表，使用其他工作表
          dataSheetName = workbook.SheetNames.find(name => name !== '填写说明') || workbook.SheetNames[0];
        }
        
        if (!dataSheetName) {
          toast.error(t('products.import.emptyFile', { defaultValue: 'Excel 文件为空或没有有效数据' }));
          return;
        }
        
        const worksheet = workbook.Sheets[dataSheetName];
        // 使用 raw: true 确保数字保持为数字类型（默认行为）
        // 使用 defval: null 确保空单元格为 null 而不是 undefined
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          raw: true, // 保持原始数据类型（数字保持为数字）
          defval: null, // 空单元格的默认值
        });

        // 标准化字段名：移除前后空格，统一处理
        // 同时确保数字字段（价格、库存）被正确转换为数字
        const normalizedData = jsonData.map(row => {
          const normalized: any = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = key.trim();
            let value = row[key];
            
            // 对于数字字段，确保转换为数字类型
            if (normalizedKey === '价格' || normalizedKey === '基础价格' || normalizedKey === '库存' || normalizedKey === '原价' || normalizedKey === '成本价' || normalizedKey === '重量(kg)') {
              if (value !== null && value !== undefined && value !== '') {
                // 如果是字符串，先清理再转换
                if (typeof value === 'string') {
                  const cleaned = value.replace(/[^\d.-]/g, '');
                  value = cleaned ? Number(cleaned) : null;
                } else {
                  value = Number(value);
                }
                // 如果转换失败，保持原值（让后续验证处理）
                if (isNaN(value)) {
                  value = row[key]; // 保持原始值用于错误提示
                }
              } else {
                value = null;
              }
            }
            
            normalized[normalizedKey] = value;
          });
          return normalized;
        });

        // 过滤空行（所有字段都为空的行）
        const filteredData = normalizedData.filter(row => {
          const values = Object.values(row);
          return values.some(val => val !== null && val !== undefined && val !== '');
        });

        if (filteredData.length === 0) {
          toast.error(t('products.import.emptyFile', { defaultValue: 'Excel 文件为空或没有有效数据' }));
          return;
        }

        // 调试：检查解析后的数据
        console.log('📊 Excel解析后的原始数据（第一行）:', filteredData[0]);
        console.log('📊 第一行的所有字段名:', Object.keys(filteredData[0] || {}));
        
        // 检查可能的图片URL字段名变体
        const possibleImageFields = ['图片URL', '图片', '图片链接', 'image', 'imageUrl', 'images', '图片地址'];
        const foundImageField = possibleImageFields.find(field => filteredData[0]?.hasOwnProperty(field));
        console.log('📊 找到的图片字段名:', foundImageField || '未找到');
        if (foundImageField) {
          console.log('📊 第一行的图片URL (使用字段名 "' + foundImageField + '"):', filteredData[0]?.[foundImageField], '类型:', typeof filteredData[0]?.[foundImageField], '值:', JSON.stringify(filteredData[0]?.[foundImageField]));
        } else {
          // 尝试模糊匹配包含"图片"的字段
          const imageLikeFields = Object.keys(filteredData[0] || {}).filter(key => 
            key.includes('图片') || key.includes('image') || key.toLowerCase().includes('img')
          );
          console.log('📊 可能的图片相关字段:', imageLikeFields);
          if (imageLikeFields.length > 0) {
            imageLikeFields.forEach(field => {
              console.log(`📊 字段 "${field}" 的值:`, filteredData[0]?.[field], '类型:', typeof filteredData[0]?.[field]);
            });
          }
        }
        
        console.log('📊 第一行的库存:', filteredData[0]?.['库存'], '类型:', typeof filteredData[0]?.['库存']);
        
        // 检查所有行的图片URL（使用标准字段名和可能的变体）
        filteredData.forEach((row, index) => {
          const imageUrl = row['图片URL'] || row['图片'] || row['图片链接'] || row['image'] || row['imageUrl'];
          if (imageUrl) {
            console.log(`📸 [Excel解析] 第 ${index + 1} 行图片URL:`, {
              raw: imageUrl,
              type: typeof imageUrl,
              stringified: JSON.stringify(imageUrl),
              length: String(imageUrl).length,
              isEmpty: String(imageUrl).trim().length === 0,
              fieldName: row['图片URL'] ? '图片URL' : row['图片'] ? '图片' : row['图片链接'] ? '图片链接' : '其他',
            });
          } else {
            console.log(`📸 [Excel解析] 第 ${index + 1} 行没有图片URL (检查了字段: 图片URL, 图片, 图片链接, image, imageUrl)`);
          }
        });

        // 验证必需字段
        const requiredFields = ['商品名称', '价格', '分类', '库存'];
        const missingFields = requiredFields.filter(field => 
          !filteredData[0].hasOwnProperty(field)
        );

        if (missingFields.length > 0) {
          toast.error(t('products.import.missingFields', { 
            fields: missingFields.join(', '),
            defaultValue: `缺少必需字段: ${missingFields.join(', ')}` 
          }));
          return;
        }

        setPreviewData(filteredData);
        // 清除之前的导入错误
        setImportErrors(new Map());
        
        // 检测新属性（在Excel中存在但系统中不存在）
        const detectedNewAttributes = detectNewAttributes(filteredData, allAttributes, categories);
        setNewAttributes(detectedNewAttributes);
        
        setShowPreview(true);
      } catch (error) {
        console.error('Parse Excel error:', error);
        toast.error(t('products.import.parseError', { defaultValue: '解析 Excel 文件失败' }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error(t('products.import.invalidFileType', { defaultValue: '请选择 Excel 文件 (.xlsx 或 .xls)' }));
        return;
      }
      parseExcelFile(file);
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error(t('products.import.invalidFileType', { defaultValue: '请选择 Excel 文件 (.xlsx 或 .xls)' }));
        return;
      }
      parseExcelFile(file);
    }
  };

  // 检测新属性（在Excel中存在但系统中不存在）
  const detectNewAttributes = (
    rows: any[],
    existingAttributes: ProductAttribute[],
    categories: Category[]
  ): Array<{
    name: string;
    displayName: string;
    type: string;
    categoryId?: string;
    values: string[];
    isVariant: boolean;
  }> => {
    const newAttrsMap = new Map<string, {
      name: string;
      displayName: string;
      values: Set<string>;
      categories: Set<string>;
      isVariant: boolean;
    }>();
    
    // 基础字段列表（不是属性）
    const baseFields = ['商品名称', '商品描述', '价格', '基础价格', '分类', '库存', '图片URL', '是否启用', 'SKU', '条形码', '重量(kg)', '原价', '成本价'];
    
    // 遍历所有行，收集新属性
    rows.forEach(row => {
      const category = categories.find(c => 
        c.name === row['分类'] || c.slug === row['分类'] || c.id === row['分类']
      );
      
      Object.keys(row).forEach(key => {
        // 跳过基础字段和空值
        if (baseFields.includes(key) || !row[key] || String(row[key]).trim() === '') {
          return;
        }
        
        // 检查这个字段是否已存在于系统中
        const existingAttr = existingAttributes.find(attr => 
          (attr.displayName || attr.name).toLowerCase() === key.toLowerCase()
        );
        
        // 如果是新属性
        if (!existingAttr) {
          const value = String(row[key]).trim();
          
          if (!newAttrsMap.has(key)) {
            newAttrsMap.set(key, {
              name: key.toLowerCase().replace(/\s+/g, '_'), // 转换为小写，空格替换为下划线
              displayName: key,
              values: new Set([value]),
              categories: new Set(category ? [category.id] : []),
              isVariant: false, // 默认不是变体，后续会根据值判断
            });
          } else {
            const attr = newAttrsMap.get(key)!;
            attr.values.add(value);
            if (category) {
              attr.categories.add(category.id);
            }
          }
        }
      });
    });
    
    // 转换为数组并智能判断类型
    return Array.from(newAttrsMap.entries()).map(([displayName, data]) => {
      const values = Array.from(data.values);
      const uniqueValues = new Set(values);
      
      // 智能判断属性类型
      let type = 'SELECT'; // 默认类型
      let isVariant = false;
      
      // 根据属性名称判断
      const nameLower = displayName.toLowerCase();
      if (nameLower.includes('颜色') || nameLower.includes('colour') || nameLower.includes('color')) {
        type = 'COLOR';
        isVariant = true;
      } else if (nameLower.includes('尺寸') || nameLower.includes('size')) {
        type = 'SELECT';
        isVariant = true;
      } else if (nameLower.includes('图片') || nameLower.includes('image')) {
        type = 'IMAGE';
        isVariant = true;
      } else {
        // 根据值的特征判断
        if (uniqueValues.size <= 10) {
          // 如果唯一值少于10个，可能是SELECT类型（变体属性）
          type = 'SELECT';
          isVariant = true;
        } else {
          // 如果唯一值很多，可能是TEXT或NUMBER类型（规格字段）
          const isNumeric = values.every(v => !isNaN(Number(v)) && v.trim() !== '');
          type = isNumeric ? 'NUMBER' : 'TEXT';
          isVariant = false;
        }
      }
      
      // 如果值很少且看起来像变体属性，标记为变体
      if (uniqueValues.size <= 20 && values.length > 1) {
        isVariant = true;
        if (type === 'TEXT' || type === 'NUMBER') {
          type = 'SELECT';
        }
      }
      
      return {
        name: data.name,
        displayName: data.displayName,
        type,
        categoryId: data.categories.size === 1 ? Array.from(data.categories)[0] : undefined,
        values: Array.from(uniqueValues).slice(0, 50), // 限制最多50个值
        isVariant,
      };
    });
  };

  // 创建新属性
  const createNewAttributesMutation = useMutation({
    mutationFn: async (attributes: typeof newAttributes) => {
      const created: ProductAttribute[] = [];
      const failed: Array<{ name: string; error: string }> = [];
      
      for (const attr of attributes) {
        try {
          const newAttr = await attributeApi.createAttribute({
            name: attr.name,
            displayName: attr.displayName,
            type: attr.type as any,
            categoryId: attr.categoryId || undefined,
            values: attr.values,
            isRequired: false,
            displayOrder: 0,
          });
          created.push(newAttr);
        } catch (error: any) {
          failed.push({
            name: attr.displayName,
            error: error?.response?.data?.message || error?.message || '创建失败',
          });
        }
      }
      
      return { created, failed };
    },
  });

  // 解析分类标识符（支持 categoryId、slug、name 三种方式）
  const resolveCategory = (categoryIdentifier: string | undefined): string | null => {
    if (!categoryIdentifier) {
      return null;
    }

    // 优先尝试作为 ID 查找
    const categoryById = categories.find(c => c.id === categoryIdentifier);
    if (categoryById) {
      return categoryById.id;
    }

    // 再尝试作为 slug 查找
    const categoryBySlug = categories.find(c => c.slug === categoryIdentifier);
    if (categoryBySlug) {
      return categoryBySlug.id;
    }

    // 最后尝试作为 name 查找（不区分大小写）
    const categoryByName = categories.find(c => 
      c.name.toLowerCase() === categoryIdentifier.toLowerCase()
    );
    if (categoryByName) {
      return categoryByName.id;
    }

    return null;
  };

  // 统一图片数组处理逻辑（与后端 normalizeImages 保持一致）
  const normalizeImages = (images: any): string[] => {
    if (Array.isArray(images)) {
      return images
        .filter((img: any) => img !== null && img !== undefined && img !== '')
        .map((img: any) => String(img).trim())
        .filter((img: string) => img.length > 0);
    }
    
    if (images !== null && images !== undefined && images !== '') {
      const imageStr = String(images).trim();
      if (imageStr.length > 0) {
        // 支持逗号分隔的多个URL
        return imageStr.split(',')
          .map((url: string) => url.trim())
          .filter((url: string) => url.length > 0);
      }
    }
    
    return [];
  };

  // 转换 Excel 数据为 API 格式
  const convertToApiFormat = (rows: any[]) => {
    console.log('🔄 开始转换数据，总行数:', rows.length);
    console.log('🔄 第一行示例:', rows[0]);
    console.log('🔄 第一行的图片URL:', rows[0]?.['图片URL'], '类型:', typeof rows[0]?.['图片URL']);
    console.log('🔄 第一行的库存:', rows[0]?.['库存'], '类型:', typeof rows[0]?.['库存']);
    
    const products: any[] = [];
    const variantGroups: Map<string, any> = new Map();
    // 建立商品索引到Excel行号的映射（用于错误映射）
    const productIndexToExcelRows = new Map<number, number[]>(); // 商品索引 -> Excel行号数组

    // 检测模式
    const productNames = rows.map(row => row['商品名称']).filter(Boolean);
    const uniqueNames = new Set(productNames);
    const isVariantMode = uniqueNames.size < productNames.length;
    
    console.log('🔄 检测到模式:', isVariantMode ? '变体模式' : '无变体模式');

    if (isVariantMode) {
      // 有变体模式：按商品名称分组
      rows.forEach((row, index) => {
        const productName = row['商品名称'];
        if (!productName) return;

        if (!variantGroups.has(productName)) {
          // 创建商品（第一行，包含完整信息）
          // 使用统一的图片处理逻辑（支持多种字段名）
          const imageValue = row['图片URL'] || row['图片'] || row['图片链接'] || row['image'] || row['imageUrl'] || '';
          const images = normalizeImages(imageValue);
          console.log(`📦 [变体-商品] ${productName} - 图片URL原始值:`, imageValue, '类型:', typeof imageValue, 'JSON:', JSON.stringify(imageValue));
          console.log(`📦 [变体-商品] ${productName} - 处理后的图片数组:`, images, '数量:', images.length);
          if (images.length === 0 && imageValue) {
            console.warn(`⚠️ [变体-商品] ${productName} - 图片URL处理结果为空，原始值:`, imageValue);
          } else if (images.length === 0 && !imageValue) {
            console.warn(`⚠️ [变体-商品] ${productName} - Excel中没有找到图片URL字段或值为空`);
          }

          const isActive = row['是否启用'] !== undefined 
            ? (typeof row['是否启用'] === 'string' 
              ? row['是否启用'].toLowerCase() === 'true' || row['是否启用'] === '是' || row['是否启用'] === '1'
              : Boolean(row['是否启用']))
            : true;

          // 提取规格字段（排除变体属性）
          const specifications: Record<string, any> = {};
          const variantAttributes: Record<string, string> = {};
          
          // 解析分类（支持 categoryId、slug、name 三种方式）
          const categoryId = resolveCategory(row['分类']);
          const category = categoryId ? categories.find(c => c.id === categoryId) : null;
          const categoryAttrs = category 
            ? allAttributes.filter(attr => !attr.categoryId || attr.categoryId === category.id)
            : allAttributes;
          
          Object.keys(row).forEach(key => {
            if (!['商品名称', '商品描述', '价格', '基础价格', '分类', '库存', '图片URL', '是否启用'].includes(key)) {
              // 检查是否是变体属性（COLOR、SELECT、IMAGE类型）
              const attr = categoryAttrs.find(a => 
                ((a.displayName || a.name).toLowerCase() === key.toLowerCase()) &&
                (a.type === 'COLOR' || a.type === 'SELECT' || a.type === 'IMAGE')
              );
              if (attr) {
                variantAttributes[key] = row[key];
              } else {
                // 其他字段作为规格字段
                specifications[key] = row[key];
              }
            }
          });

          const productIndex = products.length; // 当前商品在products数组中的索引
          const excelRowNumber = index + 2; // Excel行号（index是previewData索引，+2是因为Excel第1行是表头）
          
          // 确保images是数组格式
          const finalImages = Array.isArray(images) ? images : (images ? [images] : []);
          
          products.push({
            name: productName,
            description: row['商品描述'] || '',
            price: Number(row['基础价格'] || row['价格'] || 0),
            categoryId: categoryId || undefined,
            category: categoryId ? undefined : row['分类'], // 如果没有找到 categoryId，传递原始值让后端处理
            stock: 0, // 变体商品的总库存为0
            images: finalImages,
            isActive: isActive,
            specifications: specifications,
            hasVariants: true,
            basePrice: Number(row['基础价格'] || row['价格'] || 0),
            _excelRowNumber: excelRowNumber, // 记录Excel行号（用于错误映射）
          });
          
          // 记录商品索引到Excel行号的映射（初始化为第一行）
          productIndexToExcelRows.set(productIndex, [excelRowNumber]);
          
          variantGroups.set(productName, {
            productName,
            basePrice: Number(row['基础价格'] || row['价格'] || 0),
            category: row['分类'],
            attributes: categoryAttrs.filter(attr => 
              attr.type === 'COLOR' || attr.type === 'SELECT' || attr.type === 'IMAGE'
            ).map(attr => ({
              attributeId: attr.id,
              attributeName: attr.displayName || attr.name,
              values: [] as string[],
            })),
            variants: [] as any[],
          });
        } else {
          // 如果商品已存在，将当前行号添加到映射中
          const productIndex = products.findIndex(p => p.name === productName);
          if (productIndex >= 0) {
            const excelRowNumber = index + 2;
            const existingRows = productIndexToExcelRows.get(productIndex) || [];
            if (!existingRows.includes(excelRowNumber)) {
              existingRows.push(excelRowNumber);
              productIndexToExcelRows.set(productIndex, existingRows);
            }
          }
        }

        // 添加变体
        const group = variantGroups.get(productName)!;
        const variantAttrs: Record<string, string> = {};
        
        // 解析分类（使用group中已存储的分类信息，或当前行的分类）
        const rowCategoryId = resolveCategory(row['分类'] || group.category);
        const rowCategory = rowCategoryId ? categories.find(c => c.id === rowCategoryId) : null;
        const rowCategoryAttrs = rowCategory 
          ? allAttributes.filter(attr => !attr.categoryId || attr.categoryId === rowCategory.id)
          : allAttributes;
        
        // 使用Map记录已匹配的Excel列，避免多个属性匹配到同一列导致重复
        const matchedColumns = new Map<string, string>(); // Excel列名 -> 属性ID
        
        rowCategoryAttrs.forEach(attr => {
          if (attr.type === 'COLOR' || attr.type === 'SELECT' || attr.type === 'IMAGE') {
            const key = attr.displayName || attr.name;
            if (row[key] && row[key] !== '' && row[key] !== null && row[key] !== undefined) {
              // 检查这个Excel列是否已经被匹配过
              if (!matchedColumns.has(key)) {
                // 第一次匹配，记录并添加
                variantAttrs[attr.id] = row[key];
                matchedColumns.set(key, attr.id);
                const attrConfig = group.attributes.find((a: any) => a.attributeId === attr.id);
                if (attrConfig && !attrConfig.values.includes(row[key])) {
                  attrConfig.values.push(row[key]);
                }
              } else {
                // 该列已被匹配，记录警告但不添加（避免重复）
                console.warn(`⚠️ Excel列 "${key}" 已被属性 "${matchedColumns.get(key)}" 匹配，跳过属性 "${attr.id}"`);
              }
            }
          }
        });

        // 处理变体专属图片（如果后续行有图片URL）
        const variantImages = normalizeImages(row['图片URL']);
        console.log(`📦 [变体-变体] ${productName} - 图片URL原始值:`, row['图片URL'], '类型:', typeof row['图片URL']);
        console.log(`📦 [变体-变体] ${productName} - 处理后的图片数组:`, variantImages);

        // 使用统一的库存处理函数
        const stockValue = row['库存'];
        console.log(`📦 [变体-变体] ${productName} - 库存原始值:`, stockValue, '类型:', typeof stockValue);
        const stock = normalizeStock(stockValue);
        console.log(`📦 [变体-变体] ${productName} - 处理后的库存:`, stock);

        // 生成唯一SKU：优先使用用户提供的SKU，否则基于商品名称和属性ID+值生成
        let sku = row['SKU'];
        if (!sku || String(sku).trim() === '') {
          // 使用属性ID+值的组合，确保唯一性（避免值重复导致SKU重复）
          const attrPairs = Object.entries(variantAttrs)
            .map(([attrId, value]) => {
              // 使用属性ID的前4位 + 属性值，确保唯一性
              const attrIdShort = attrId.substring(0, 8).replace(/[^a-zA-Z0-9]/g, '');
              const valueSlug = String(value)
                .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
                .toLowerCase()
                .substring(0, 20); // 限制长度
              return `${attrIdShort}-${valueSlug}`;
            })
            .filter(pair => pair && pair !== '-')
            .join('-');
          
          // 使用商品名称、属性对、行号和时间戳确保唯一性
          const productNameSlug = String(productName)
            .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
            .toLowerCase()
            .substring(0, 30);
          
          // 生成SKU：商品名-属性对-行号-时间戳
          const timestamp = Date.now().toString(36);
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          sku = `${productNameSlug}-${attrPairs || 'default'}-${index}-${timestamp}-${randomSuffix}`;
          
          // 限制SKU长度（数据库限制通常是100字符）
          if (sku.length > 100) {
            sku = sku.substring(0, 100);
          }
        } else {
          sku = String(sku).trim();
        }
        
        console.log(`🔑 [SKU生成] ${productName} - 生成的SKU:`, sku, '属性对:', Object.entries(variantAttrs));

        group.variants.push({
          sku: sku,
          price: Number(row['价格'] || group.basePrice),
          stock: stock,
          images: variantImages, // 变体专属图片，使用统一的处理函数
          attributes: variantAttrs,
          isActive: row['是否启用'] !== undefined 
            ? (typeof row['是否启用'] === 'string' 
              ? row['是否启用'].toLowerCase() === 'true' || row['是否启用'] === '是' || row['是否启用'] === '1'
              : Boolean(row['是否启用']))
            : true,
        });
      });
    } else {
      // 无变体模式：一行一个商品
      rows.forEach((row, index) => {
        const productName = row['商品名称'];
        const excelRowNumber = index + 2; // Excel行号（index是previewData索引，+2是因为Excel第1行是表头）
        const productIndex = products.length; // 当前商品在products数组中的索引
        
        // 使用统一的图片处理逻辑（支持多种字段名）
        const imageValue = row['图片URL'] || row['图片'] || row['图片链接'] || row['image'] || row['imageUrl'] || '';
        const images = normalizeImages(imageValue);
        console.log(`📦 [无变体] ${productName} - 图片URL原始值:`, imageValue, '类型:', typeof imageValue, 'JSON:', JSON.stringify(imageValue));
        console.log(`📦 [无变体] ${productName} - 处理后的图片数组:`, images, '数量:', images.length);
        if (images.length === 0 && imageValue) {
          console.warn(`⚠️ [无变体] ${productName} - 图片URL处理结果为空，原始值:`, imageValue);
        } else if (images.length === 0 && !imageValue) {
          console.warn(`⚠️ [无变体] ${productName} - Excel中没有找到图片URL字段或值为空`);
        }

        const isActive = row['是否启用'] !== undefined 
          ? (typeof row['是否启用'] === 'string' 
            ? row['是否启用'].toLowerCase() === 'true' || row['是否启用'] === '是' || row['是否启用'] === '1'
            : Boolean(row['是否启用']))
          : true;

        // 提取规格字段
        const specifications: Record<string, any> = {};
        Object.keys(row).forEach(key => {
          if (!['商品名称', '商品描述', '价格', '分类', '库存', '图片URL', '是否启用'].includes(key)) {
            specifications[key] = row[key];
          }
        });

        // 使用统一的库存处理函数
        const stockValue = row['库存'];
        console.log(`📦 [无变体] ${productName} - 库存原始值:`, stockValue, '类型:', typeof stockValue);
        const stock = normalizeStock(stockValue);
        console.log(`📦 [无变体] ${productName} - 处理后的库存:`, stock);

        // 解析分类（支持 categoryId、slug、name 三种方式）
        const categoryId = resolveCategory(row['分类']);

        // 确保images是数组格式
        const finalImages = Array.isArray(images) ? images : (images ? [images] : []);
        
        products.push({
          name: row['商品名称'],
          description: row['商品描述'],
          price: Number(row['价格']),
          categoryId: categoryId || undefined,
          category: categoryId ? undefined : row['分类'], // 如果没有找到 categoryId，传递原始值让后端处理
          stock: stock,
          images: finalImages,
          isActive: isActive,
          specifications: specifications,
          hasVariants: false,
          _excelRowNumber: excelRowNumber, // 记录Excel行号（用于错误映射）
        });
        
        // 记录商品索引到Excel行号的映射
        productIndexToExcelRows.set(productIndex, [excelRowNumber]);
      });
    }

    console.log('✅ 转换完成，商品数量:', products.length, '变体组数量:', variantGroups.size);
    console.log('✅ 商品索引到Excel行号映射:', Array.from(productIndexToExcelRows.entries()));
    console.log('✅ 第一个商品示例:', products[0]);
    if (variantGroups.size > 0) {
      const firstGroup = Array.from(variantGroups.values())[0];
      console.log('✅ 第一个变体组示例:', firstGroup);
      if (firstGroup.variants && firstGroup.variants.length > 0) {
        console.log('✅ 第一个变体示例:', firstGroup.variants[0]);
      }
    }
    
    return {
      products,
      variants: Array.from(variantGroups.values()),
      productIndexToExcelRows, // 返回映射关系
    };
  };

  // 执行导入
  const handleImport = async () => {
    // ========== 第一步：严格验证检查 ==========
    if (previewData.length === 0) {
      toast.error(t('products.import.noData', { defaultValue: '没有可导入的数据' }));
      return;
    }

    // 强制验证检查 - 如果有任何错误，完全阻止导入
    if (!validationResults.valid) {
      const errorCount = validationResults.errors.length;
      toast.error(
        `数据验证失败！发现 ${errorCount} 个错误，必须修复后才能导入。请查看下方的错误列表。`,
        { duration: 8000 }
      );
      // 滚动到错误显示区域
      setTimeout(() => {
        const errorElement = document.querySelector('.bg-red-50');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return; // 完全阻止，不执行任何导入操作
    }

    // 如果正在加载现有商品名称，等待完成
    if (isLoadingExistingProducts) {
      toast.error('正在验证商品名称，请稍候...', { duration: 3000 });
      return;
    }

    // 如果启用自动创建新属性，且检测到新属性
    if (autoCreateAttributes && newAttributes.length > 0) {
      try {
        toast.loading(t('products.import.creatingAttributes', { 
          count: newAttributes.length,
          defaultValue: `正在创建 ${newAttributes.length} 个新属性...` 
        }));
        
        const result = await createNewAttributesMutation.mutateAsync(newAttributes);
        
        if (result.failed.length > 0) {
          toast.error(t('products.import.attributeCreationFailed', {
            count: result.failed.length,
            defaultValue: `${result.failed.length} 个属性创建失败，请检查后重试`
          }));
          // 显示失败的属性
          result.failed.forEach(f => {
            console.error(`属性 "${f.name}" 创建失败: ${f.error}`);
          });
        }
        
        if (result.created.length > 0) {
          toast.success(t('products.import.attributesCreated', {
            count: result.created.length,
            defaultValue: `成功创建 ${result.created.length} 个新属性`
          }));
          
          // 刷新属性列表
          queryClient.invalidateQueries({ queryKey: ['attributes', 'all'] });
          
          // 更新 allAttributes（添加新创建的属性）
          const updatedAttributes = [...allAttributes, ...result.created];
          // 重新检测新属性（因为已经创建了一些）
          const remainingNewAttrs = detectNewAttributes(previewData, updatedAttributes, categories);
          setNewAttributes(remainingNewAttrs);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('products.import.attributeCreationError', { 
          defaultValue: '创建新属性时出错' 
        }));
        return;
      }
    }

    // ========== 第二步：数据转换和调试检查 ==========
    const { products, variants, productIndexToExcelRows } = convertToApiFormat(previewData);
    
    // 保存映射关系，用于错误映射
    productIndexToExcelRowsRef.current = productIndexToExcelRows;
    
    // 调试：检查准备导入的数据
    console.log('📤 [导入前检查] 准备导入，商品数量:', products.length, '变体组数量:', variants.length);
    
    // 检查每个商品的库存
    products.forEach((product, index) => {
      console.log(`📦 [导入前检查] 商品 ${index + 1} "${product.name}":`, {
        stock: product.stock,
        stockType: typeof product.stock,
        stockValue: product.stock,
        hasVariants: product.hasVariants,
        images: product.images?.length || 0,
        fullProduct: JSON.stringify(product, null, 2), // 完整商品数据用于调试
      });
      
      // 如果库存为0但hasVariants为false，发出警告
      if (!product.hasVariants && product.stock === 0) {
        console.warn(`⚠️ [导入前检查] 商品 "${product.name}" 的库存为0，请确认是否正确`);
      }
    });
    
    if (variants.length > 0) {
      variants.forEach((variantGroup, groupIndex) => {
        console.log(`📦 [导入前检查] 变体组 ${groupIndex + 1} "${variantGroup.productName}":`, {
          variantsCount: variantGroup.variants?.length || 0,
        });
        variantGroup.variants?.forEach((variant: any, vIndex: number) => {
          console.log(`  - 变体 ${vIndex + 1} SKU "${variant.sku}":`, {
            stock: variant.stock,
            stockType: typeof variant.stock,
            price: variant.price,
          });
        });
      });
    }
    
    // ========== 第三步：执行导入 ==========
    importMutation.mutate({ products, variants });
  };

  // 预览数据验证
  const validationResults = useMemo(() => {
    if (previewData.length === 0) return { valid: true, errors: [], rowErrors: new Map() };

    const errors: string[] = [];
    const warnings: string[] = [];
    const rowErrors = new Map<number, string[]>(); // 行号 -> 错误列表
    
    // 合并导入后的错误信息（从后端返回的）
    importErrors.forEach((errorList, rowIndex) => {
      if (!rowErrors.has(rowIndex)) {
        rowErrors.set(rowIndex, []);
      }
      rowErrors.get(rowIndex)!.push(...errorList);
      errors.push(...errorList.map(err => `第 ${rowIndex + 2} 行：${err}`));
    });
    const productNames = previewData.map(row => row['商品名称']).filter(Boolean);
    const uniqueNames = new Set(productNames);
    const isVariantMode = uniqueNames.size < productNames.length;
    
    // 获取数据库中已有的商品名称（用于检查重复）
    const existingProductNames = existingProducts ? new Set(existingProducts) : new Set<string>();

    // 收集所有SKU用于重复检查
    const skus = new Map<string, number>(); // SKU -> 行号

    // 收集商品名称用于重复检查（在无变体模式下，商品名称必须唯一）
    const productNameMap = new Map<string, number>(); // 商品名称 -> 第一次出现的行号

    // 在变体模式下，为每个商品名称记录第一行的分类（用于后续行验证）
    const productFirstRowCategory = new Map<string, string>();
    if (isVariantMode) {
      previewData.forEach((row) => {
        const productName = row['商品名称'];
        if (productName && !productFirstRowCategory.has(productName) && row['分类']) {
          productFirstRowCategory.set(productName, row['分类']);
        }
      });
    }

    // 辅助函数：添加行错误
    const addRowError = (rowIndex: number, error: string) => {
      if (!rowErrors.has(rowIndex)) {
        rowErrors.set(rowIndex, []);
      }
      rowErrors.get(rowIndex)!.push(error);
      errors.push(error);
    };

    previewData.forEach((row, index) => {
      const rowNumber = index + 2; // Excel行号（包含表头）
      
      if (!row['商品名称']) {
        addRowError(index, `缺少商品名称`);
      } else {
        const productName = String(row['商品名称']).trim();
        const productNameLower = productName.toLowerCase();
        
        // 检查商品名称是否与数据库中已有的商品重复
        if (existingProductNames.has(productNameLower)) {
          addRowError(index, `商品名称 "${productName}" 与数据库中已有商品重复`);
        }
        
        // 在无变体模式下，检查商品名称在 Excel 内部是否重复
        if (!isVariantMode) {
          if (productNameMap.has(productName)) {
            addRowError(index, `商品名称与第 ${productNameMap.get(productName)! + 2} 行重复（无变体模式下商品名称必须唯一）`);
          } else {
            productNameMap.set(productName, index);
          }
        } else {
          // 变体模式下，检查同一商品名称的第一行是否与数据库重复
          if (!productNameMap.has(productName)) {
            productNameMap.set(productName, index);
            if (existingProductNames.has(productNameLower)) {
              addRowError(index, `商品名称 "${productName}" 与数据库中已有商品重复`);
            }
          }
        }
      }
      if (!row['商品描述'] && !isVariantMode) {
        addRowError(index, `缺少商品描述`);
      }
      
      // 分类验证：在变体模式下，如果当前行分类为空，使用第一行的分类
      let categoryToCheck = row['分类'];
      if (isVariantMode && !categoryToCheck && row['商品名称']) {
        categoryToCheck = productFirstRowCategory.get(row['商品名称']) || '';
      }
      
      if (!categoryToCheck) {
        addRowError(index, `缺少分类`);
      } else {
        const category = categories.find(c => 
          c.name === categoryToCheck || c.slug === categoryToCheck || c.id === categoryToCheck
        );
        if (!category) {
          addRowError(index, `分类 "${categoryToCheck}" 不存在`);
        }
      }
      
      // 价格验证（更严格的验证）
      if (!isVariantMode) {
        if (!row['价格']) {
          addRowError(index, `缺少价格`);
        } else {
          let priceValue = row['价格'];
          if (typeof priceValue === 'string') {
            const cleaned = priceValue.replace(/[^\d.-]/g, '');
            priceValue = cleaned;
          }
          const price = Number(priceValue);
          if (isNaN(price)) {
            addRowError(index, `价格无效（"${row['价格']}" 无法转换为数字）`);
          } else if (price <= 0) {
            addRowError(index, `价格无效（必须是大于0的数字，当前值：${price}）`);
          } else if (price > 1000000) {
            warnings.push(`第 ${rowNumber} 行：价格异常高（${price}），请确认是否正确`);
          }
        }
      } else {
        // 变体模式：第一行必须有价格，后续行如果没有价格则使用基础价格
        if (index === 0 || !productFirstRowCategory.has(row['商品名称'])) {
          // 第一行或新商品的第一行
          if (!row['价格'] && !row['基础价格']) {
            addRowError(index, `缺少价格或基础价格`);
          } else {
            let priceValue = row['价格'] || row['基础价格'] || 0;
            if (typeof priceValue === 'string') {
              const cleaned = String(priceValue).replace(/[^\d.-]/g, '');
              priceValue = cleaned;
            }
            const price = Number(priceValue);
            if (isNaN(price)) {
              addRowError(index, `价格无效（"${row['价格'] || row['基础价格']}" 无法转换为数字）`);
            } else if (price <= 0) {
              addRowError(index, `价格无效（必须是大于0的数字，当前值：${price}）`);
            } else if (price > 1000000) {
              warnings.push(`第 ${rowNumber} 行：价格异常高（${price}），请确认是否正确`);
            }
          }
        } else {
          // 后续行：如果没有价格，使用基础价格（不报错，但需要验证基础价格存在）
          if (row['价格']) {
            let priceValue = row['价格'];
            if (typeof priceValue === 'string') {
              const cleaned = String(priceValue).replace(/[^\d.-]/g, '');
              priceValue = cleaned;
            }
            const price = Number(priceValue);
            if (isNaN(price)) {
              addRowError(index, `价格无效（"${row['价格']}" 无法转换为数字）`);
            } else if (price <= 0) {
              addRowError(index, `价格无效（必须是大于0的数字，当前值：${price}）`);
            } else if (price > 1000000) {
              warnings.push(`第 ${rowNumber} 行：价格异常高（${price}），请确认是否正确`);
            }
          }
        }
      }

      // 库存验证（对于无变体商品，库存是必填的）
      if (!isVariantMode) {
        if (row['库存'] === undefined || row['库存'] === null || row['库存'] === '') {
          addRowError(index, `缺少库存`);
        } else {
          // 更严格的库存验证
          let stockValue = row['库存'];
          if (typeof stockValue === 'string') {
            // 清理字符串中的非数字字符
            const cleaned = stockValue.replace(/[^\d.-]/g, '');
            stockValue = cleaned;
          }
          const stock = Number(stockValue);
          if (isNaN(stock)) {
            addRowError(index, `库存无效（"${row['库存']}" 无法转换为数字）`);
          } else if (stock < 0) {
            addRowError(index, `库存无效（必须是非负整数，当前值：${stock}）`);
          } else if (!Number.isInteger(stock)) {
            warnings.push(`第 ${rowNumber} 行：库存包含小数部分（${stock}），将自动取整为 ${Math.floor(stock)}`);
          }
        }
      } else {
        // 变体模式：每个变体行都应该有库存
        if (row['库存'] === undefined || row['库存'] === null || row['库存'] === '') {
          addRowError(index, `缺少库存`);
        } else {
          // 更严格的库存验证
          let stockValue = row['库存'];
          if (typeof stockValue === 'string') {
            const cleaned = stockValue.replace(/[^\d.-]/g, '');
            stockValue = cleaned;
          }
          const stock = Number(stockValue);
          if (isNaN(stock)) {
            addRowError(index, `库存无效（"${row['库存']}" 无法转换为数字）`);
          } else if (stock < 0) {
            addRowError(index, `库存无效（必须是非负整数，当前值：${stock}）`);
          } else if (!Number.isInteger(stock)) {
            warnings.push(`第 ${rowNumber} 行：库存包含小数部分（${stock}），将自动取整为 ${Math.floor(stock)}`);
          }
        }
      }

      // 图片URL格式验证（如果提供了）
      if (row['图片URL']) {
        const imageStr = String(row['图片URL']).trim();
        if (imageStr) {
          const urls = imageStr.split(',').map(url => url.trim()).filter(url => url);
          urls.forEach((url, urlIndex) => {
            // 简单的URL格式验证
            try {
              new URL(url);
            } catch {
              addRowError(index, `图片URL格式无效（第${urlIndex + 1}个URL）`);
            }
          });
        }
      }

      // SKU验证和重复检查
      if (row['SKU']) {
        const sku = String(row['SKU']).trim();
        if (sku) {
          if (skus.has(sku)) {
            addRowError(index, `SKU "${sku}" 与第 ${skus.get(sku)! + 2} 行重复`);
          } else {
            skus.set(sku, index);
          }
        }
      } else if (isVariantMode && row['商品名称']) {
        // 对于变体模式，如果没有提供SKU，生成一个用于检查重复
        const productName = row['商品名称'];
        const variantAttrs: string[] = [];
        
        // 收集变体属性值
        Object.keys(row).forEach(key => {
          if (!['商品名称', '商品描述', '价格', '基础价格', '分类', '库存', '图片URL', '是否启用', 'SKU'].includes(key)) {
            const value = row[key];
            if (value !== undefined && value !== null && value !== '') {
              variantAttrs.push(String(value));
            }
          }
        });
        
        // 生成临时SKU用于检查重复
        const tempSku = `${productName}-${variantAttrs.join('-')}-${index}`;
        if (skus.has(tempSku)) {
          addRowError(index, `变体属性组合与第 ${skus.get(tempSku)! + 2} 行重复，请为每个变体指定唯一的SKU`);
        } else {
          skus.set(tempSku, index);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      isVariantMode,
      rowErrors, // 每行的错误信息（包含预览验证错误和导入后的错误）
    };
  }, [previewData, categories, existingProducts, importErrors]);

  return (
    <div className="space-y-6">
      {/* 标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text-primary">
            {t('products.import.title', { defaultValue: '批量导入商品' })}
          </h2>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            title={t('products.import.showGuide', { defaultValue: '显示使用说明' })}
          >
            <HelpCircle size={20} />
          </button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

       {/* 使用说明 */}
       {showGuide && (
         <Card className="p-6 bg-blue-50 border-blue-200">
           <div className="space-y-6">
             <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
               <HelpCircle size={20} className="text-brand-blue" />
               {t('products.import.guide.title', { defaultValue: '使用说明' })}
             </h3>
             
             {/* 核心规则 */}
             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
               <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                 <AlertCircle size={20} className="text-yellow-600" />
                 {t('products.import.guide.coreRule', { defaultValue: '核心规则（重要！）' })}
               </h4>
               <ul className="text-sm text-yellow-700 space-y-2">
                 <li className="flex items-start gap-2">
                   <span className="font-bold">•</span>
                   <span><strong>相同商品名称</strong>的多行 = 同一商品的不同变体</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="font-bold">•</span>
                   <span><strong>不同商品名称</strong>的行 = 不同的商品</span>
                 </li>
               </ul>
             </div>

             {/* 填写示例 */}
             <div className="bg-white p-4 rounded-lg border border-blue-200">
               <h4 className="font-semibold text-text-primary mb-3">填写示例：</h4>
               
               <div className="space-y-4">
                 <div>
                   <p className="text-sm font-semibold text-text-primary mb-2">有变体的商品：</p>
                   <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                     <div className="text-text-secondary mb-2">商品名称 | 颜色 | 尺寸 | 价格 | 库存 | 分类</div>
                     <div className="text-green-600 font-semibold">T恤     | 红色 | 大   | 99.99| 100 | 服装  ← 第一行：完整信息</div>
                     <div className="text-blue-600">T恤     | 蓝色 | 大   | 99.99| 80  | (留空) ← 第二行：相同名称，不同变体</div>
                     <div className="text-blue-600">T恤     | 红色 | 中   | 109.99| 50  | (留空) ← 第三行：相同名称，不同变体</div>
                     <div className="text-text-tertiary text-xs mt-2">↑ 上面3行表示：1个商品"T恤"，有3个变体</div>
                   </div>
                   <div className="mt-2 text-xs text-text-secondary bg-blue-50 p-2 rounded">
                     <strong>提示：</strong>后续行只需填写商品名称（与第一行相同）、价格、库存和变体属性。描述、分类等可以留空。
                   </div>
                 </div>

                 <div>
                   <p className="text-sm font-semibold text-text-primary mb-2">无变体的商品：</p>
                   <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                     <div className="text-text-secondary mb-2">商品名称 | 价格 | 库存 | 分类</div>
                     <div className="text-text-primary">手机     | 2999 | 50  | 电子产品</div>
                     <div className="text-text-primary">耳机     | 199  | 100 | 电子产品</div>
                     <div className="text-text-tertiary text-xs mt-2">↑ 每行代表一个独立的商品</div>
                   </div>
                 </div>
               </div>
             </div>

             {/* 步骤说明 */}
             <div className="bg-white p-4 rounded-lg border border-blue-200">
               <h4 className="font-semibold text-text-primary mb-3">操作步骤：</h4>
               <div className="space-y-2 text-sm text-text-secondary ml-4">
                 <div className="flex items-start gap-2">
                   <span className="font-semibold text-brand-blue">1.</span>
                   <span>{t('products.import.guide.downloadTemplate', { defaultValue: '下载模板，模板包含所有可能的属性字段，分类字段为下拉选择' })}</span>
                 </div>
                 <div className="flex items-start gap-2">
                   <span className="font-semibold text-brand-blue">2.</span>
                   <span>{t('products.import.guide.fillData', { defaultValue: '在Excel中填写商品数据，分类字段从下拉列表中选择' })}</span>
                 </div>
                 <div className="flex items-start gap-2">
                   <span className="font-semibold text-brand-blue">3.</span>
                   <span>{t('products.import.guide.upload', { defaultValue: '上传填写好的 Excel 文件，系统会自动验证并显示预览' })}</span>
                 </div>
               </div>
             </div>
           </div>
         </Card>
       )}


      {/* 下载模板按钮 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t('products.import.template.title', { defaultValue: '下载模板' })}
            </h3>
            <p className="text-sm text-text-secondary">
              {t('products.import.template.description', { defaultValue: '下载 Excel 模板文件，模板包含所有可能的属性字段。分类字段为下拉选择，可直接在Excel中选择。模板包含填写说明和示例，请参考填写。' })}
            </p>
          </div>
           <Button
             onClick={downloadTemplate}
             variant="outline"
             className="flex items-center gap-2"
           >
             <Download size={18} />
             {t('products.import.template.download', { defaultValue: '下载模板' })}
           </Button>
        </div>
      </Card>

      {/* 上传区域 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('products.import.upload.title', { defaultValue: '上传 Excel 文件' })}
        </h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-colors
            ${isDragging ? 'border-brand-blue bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}
        >
          <FileSpreadsheet size={48} className="mx-auto mb-4 text-text-tertiary" />
          <p className="text-text-secondary mb-2">
            {t('products.import.upload.dragDrop', { defaultValue: '拖拽 Excel 文件到此处，或点击下方按钮选择文件' })}
          </p>
          <p className="text-xs text-text-tertiary mb-4">
            {t('products.import.upload.supportedFormats', { defaultValue: '支持 .xlsx 和 .xls 格式' })}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex items-center gap-2 mx-auto"
          >
            <Upload size={18} />
            {t('products.import.upload.selectFile', { defaultValue: '选择文件' })}
          </Button>
        </div>
      </Card>

      {/* 导入选项 */}
      {previewData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {t('products.import.options.title', { defaultValue: '导入选项' })}
          </h3>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCreateAttributes}
                onChange={(e) => setAutoCreateAttributes(e.target.checked)}
                className="mt-1 w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">
                  {t('products.import.options.autoCreateAttributes', { 
                    defaultValue: '自动创建新属性' 
                  })}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  {t('products.import.options.autoCreateAttributesDesc', { 
                    defaultValue: '如果Excel中包含系统中不存在的属性字段，将自动创建这些属性。系统会智能判断属性类型（颜色、尺寸等变体属性或规格字段）。' 
                  })}
                </div>
              </div>
            </label>
            
            {newAttributes.length > 0 && (
              <div className={`p-4 rounded-lg border ${
                autoCreateAttributes 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  <Info size={18} className={`mt-0.5 ${
                    autoCreateAttributes ? 'text-blue-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      autoCreateAttributes ? 'text-blue-800' : 'text-yellow-800'
                    }`}>
                      {autoCreateAttributes 
                        ? t('products.import.newAttributesWillBeCreated', {
                            count: newAttributes.length,
                            defaultValue: `检测到 ${newAttributes.length} 个新属性，将在导入时自动创建`
                          })
                        : t('products.import.newAttributesDetected', {
                            count: newAttributes.length,
                            defaultValue: `检测到 ${newAttributes.length} 个新属性，但未启用自动创建`
                          })
                      }
                    </div>
                    <div className="mt-2 space-y-1">
                      {newAttributes.slice(0, 5).map((attr, idx) => (
                        <div key={idx} className={`text-xs ${
                          autoCreateAttributes ? 'text-blue-700' : 'text-yellow-700'
                        }`}>
                          • {attr.displayName} ({attr.type})
                          {attr.isVariant && (
                            <span className="ml-1 px-1.5 py-0.5 bg-white/50 rounded text-[10px]">
                              {t('products.import.variantAttribute', { defaultValue: '变体' })}
                            </span>
                          )}
                        </div>
                      ))}
                      {newAttributes.length > 5 && (
                        <div className={`text-xs ${
                          autoCreateAttributes ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                          ...还有 {newAttributes.length - 5} 个新属性
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 数据预览 */}
      {showPreview && previewData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-text-primary">
                {t('products.import.preview.title', { defaultValue: '数据预览' })} ({previewData.length} {t('products.import.preview.items', { defaultValue: '条' })})
              </h3>
              {validationResults.isVariantMode && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                  <Info size={14} />
                  {t('products.import.variantModeDetected', { defaultValue: '检测到变体模式' })}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setShowPreview(false);
                setPreviewData([]);
                setImportErrors(new Map()); // 清除导入错误
              }}
              className="p-2 text-text-tertiary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* 验证结果 */}
          {isLoadingExistingProducts && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                正在检查商品名称是否重复...
              </div>
            </div>
          )}
          {!validationResults.valid && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                {t('products.import.validationErrors', { defaultValue: '验证错误' })} ({validationResults.errors.length} 个错误，必须修复后才能导入):
              </div>
              <ul className="text-xs text-red-700 space-y-1 max-h-60 overflow-y-auto">
                {validationResults.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {validationResults.warnings && validationResults.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                警告 ({validationResults.warnings.length} 个，不影响导入):
              </div>
              <ul className="text-xs text-yellow-700 space-y-1 max-h-40 overflow-y-auto">
                {validationResults.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">行号</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">商品名称</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">价格</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">分类</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">库存</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((row, index) => {
                  // 在变体模式下，如果当前行分类为空，使用第一行的分类
                  let categoryToCheck = row['分类'];
                  if (validationResults.isVariantMode && !categoryToCheck && row['商品名称']) {
                    // 查找该商品的第一行（有分类的行）
                    const firstRowWithCategory = previewData.find(
                      r => r['商品名称'] === row['商品名称'] && r['分类']
                    );
                    categoryToCheck = firstRowWithCategory?.['分类'] || '';
                  }
                  
                  const category = categoryToCheck ? categories.find(c => 
                    c.name === categoryToCheck || c.slug === categoryToCheck || c.id === categoryToCheck
                  ) : null;
                  
                  // 获取该行的错误信息
                  const rowErrorList = validationResults.rowErrors?.get(index) || [];
                  const hasError = rowErrorList.length > 0;
                  
                  return (
                    <tr 
                      key={index} 
                      className={hasError ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
                      title={hasError ? `第 ${index + 2} 行有 ${rowErrorList.length} 个错误` : ''}
                    >
                      <td className="px-4 py-2 text-text-secondary font-medium">{index + 2}</td>
                      <td className={`px-4 py-2 ${hasError ? 'text-red-700 font-medium' : 'text-text-primary'}`}>
                        {row['商品名称'] || <span className="text-red-500 italic">缺少商品名称</span>}
                      </td>
                      <td className={`px-4 py-2 ${hasError && !row['价格'] && !row['基础价格'] ? 'text-red-700' : 'text-text-primary'}`}>
                        ${Number(row['价格'] || row['基础价格'] || 0).toFixed(2)}
                      </td>
                      <td className={`px-4 py-2 ${hasError && !categoryToCheck ? 'text-red-700' : 'text-text-primary'}`}>
                        {categoryToCheck ? (
                          category ? (
                            <span className="text-green-600">
                              {category.name}
                              {validationResults.isVariantMode && !row['分类'] && (
                                <span className="ml-1 text-xs text-text-tertiary">(继承第一行)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium flex items-center gap-1">
                              <AlertCircle size={14} />
                              {categoryToCheck} (不存在)
                            </span>
                          )
                        ) : (
                          <span className="text-red-500 italic font-medium">缺少分类</span>
                        )}
                      </td>
                      <td className={`px-4 py-2 ${hasError && (row['库存'] === undefined || row['库存'] === null || row['库存'] === '') ? 'text-red-700' : 'text-text-primary'}`}>
                        {row['库存'] !== undefined && row['库存'] !== null && row['库存'] !== '' 
                          ? Number(row['库存']) 
                          : <span className="text-red-500 italic font-medium">缺少库存</span>}
                      </td>
                      <td className="px-4 py-2">
                        {hasError ? (
                          <div className="flex flex-col items-start gap-1">
                            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                            <div className="text-xs text-red-600 mt-1 max-w-xs">
                              <div className="font-medium mb-1">错误 ({rowErrorList.length}):</div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {rowErrorList.map((error: string, errIndex: number) => (
                                  <li key={errIndex} className="text-left">{error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div title="验证通过">
                            <CheckCircle size={18} className="text-green-500" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(false);
                setPreviewData([]);
                setImportErrors(new Map()); // 清除导入错误
              }}
            >
              {t('common.cancel', { defaultValue: '取消' })}
            </Button>
            <Button
              onClick={handleImport}
              loading={importMutation.isPending || isLoadingExistingProducts}
              disabled={previewData.length === 0 || !validationResults.valid || isLoadingExistingProducts}
              className="flex items-center gap-2"
              title={
                isLoadingExistingProducts 
                  ? '正在验证数据，请稍候...' 
                  : !validationResults.valid 
                    ? `请先修复 ${validationResults.errors.length} 个验证错误` 
                    : previewData.length === 0 
                      ? '没有可导入的数据' 
                      : ''
              }
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('products.import.importing', { defaultValue: '导入中...' })}
                </>
              ) : (
                <>
                  <Upload size={18} />
                  {t('products.import.startImport', { defaultValue: '开始导入' })}
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductExcelImport;

