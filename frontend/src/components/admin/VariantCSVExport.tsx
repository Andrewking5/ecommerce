import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ProductVariant } from '@/types/variant';
import { generateCSV, downloadCSV, VariantCSVRow } from '@/utils/csvParser';

interface VariantCSVExportProps {
  variants: ProductVariant[];
  productName?: string;
}

const VariantCSVExport: React.FC<VariantCSVExportProps> = ({
  variants,
  productName = 'variants',
}) => {
  const { t } = useTranslation(['admin', 'common']);

  const handleExport = () => {
    if (variants.length === 0) {
      return;
    }

    // 提取所有属性名
    const attributeNames = new Set<string>();
    variants.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        if (attr.attribute) {
          attributeNames.add(attr.attribute.displayName || attr.attribute.name);
        }
      });
    });

    // 转换为 CSV 行格式
    const csvRows: VariantCSVRow[] = variants.map((variant) => {
      const attributes: Record<string, string> = {};
      variant.attributes?.forEach((attr) => {
        if (attr.attribute) {
          const attrName = attr.attribute.displayName || attr.attribute.name;
          attributes[attrName] = attr.value;
        }
      });

      return {
        sku: variant.sku,
        attributes,
        price: Number(variant.price),
        comparePrice: variant.comparePrice ? Number(variant.comparePrice) : undefined,
        stock: variant.stock,
        images: variant.images || [],
        isActive: variant.isActive,
      };
    });

    // 生成 CSV
    const csvContent = generateCSV(csvRows, Array.from(attributeNames));
    
    // 下载
    const filename = `${productName}-variants-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        className="w-full"
        aria-label={t('admin:variants.exportCSV', { defaultValue: '导出 CSV' })}
      >
        <Download size={16} className="mr-2" />
        {t('admin:variants.exportCSV', {
          count: variants.length,
          defaultValue: `导出 CSV (${variants.length} 个变体)`,
        })}
      </Button>
    </Card>
  );
};

export default VariantCSVExport;

