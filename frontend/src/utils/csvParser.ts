/**
 * CSV 解析和生成工具
 */

export interface VariantCSVRow {
  sku: string;
  attributes: Record<string, string>; // {属性名: 属性值}
  price: number;
  comparePrice?: number;
  stock: number;
  images?: string[];
  isActive?: boolean;
}

/**
 * 解析 CSV 文件
 */
export const parseCSV = (csvText: string): VariantCSVRow[] => {
  const lines = csvText.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  // 解析表头
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const skuIndex = headers.findIndex((h) => h.toLowerCase() === 'sku');
  const priceIndex = headers.findIndex((h) => h.toLowerCase() === 'price');
  const stockIndex = headers.findIndex((h) => h.toLowerCase() === 'stock' || h.toLowerCase() === '库存');
  const comparePriceIndex = headers.findIndex((h) => h.toLowerCase() === 'compareprice' || h.toLowerCase() === '原价');
  const imagesIndex = headers.findIndex((h) => h.toLowerCase() === 'images' || h.toLowerCase() === '图片');
  const isActiveIndex = headers.findIndex((h) => h.toLowerCase() === 'isactive' || h.toLowerCase() === '状态');

  // 找出所有属性列（除了已知的列）
  const knownColumns = ['sku', 'price', 'stock', 'compareprice', '原价', 'images', '图片', 'isactive', '状态'];
  const attributeColumns = headers
    .map((h, i) => ({ name: h, index: i }))
    .filter((col) => !knownColumns.includes(col.name.toLowerCase()));

  const rows: VariantCSVRow[] = [];

  // 解析数据行
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: VariantCSVRow = {
      sku: skuIndex >= 0 ? values[skuIndex] || '' : `SKU-${i}`,
      attributes: {},
      price: priceIndex >= 0 ? parseFloat(values[priceIndex]) || 0 : 0,
      stock: stockIndex >= 0 ? parseInt(values[stockIndex]) || 0 : 0,
    };

    // 解析属性
    attributeColumns.forEach((col) => {
      if (values[col.index]) {
        row.attributes[col.name] = values[col.index];
      }
    });

    // 解析可选字段
    if (comparePriceIndex >= 0 && values[comparePriceIndex]) {
      row.comparePrice = parseFloat(values[comparePriceIndex]);
    }
    if (imagesIndex >= 0 && values[imagesIndex]) {
      row.images = values[imagesIndex].split(',').map((url) => url.trim()).filter(Boolean);
    }
    if (isActiveIndex >= 0 && values[isActiveIndex]) {
      row.isActive = values[isActiveIndex].toLowerCase() === 'true' || values[isActiveIndex] === '1' || values[isActiveIndex] === '启用';
    }

    rows.push(row);
  }

  return rows;
};

/**
 * 解析 CSV 行（处理引号内的逗号）
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 转义的双引号
        current += '"';
        i++;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // 添加最后一个字段
  result.push(current.trim());

  return result;
};

/**
 * 生成 CSV 文件
 */
export const generateCSV = (variants: VariantCSVRow[], attributeNames: string[]): string => {
  // 构建表头
  const headers = [
    'SKU',
    ...attributeNames,
    'Price',
    'Compare Price',
    'Stock',
    'Images',
    'Is Active',
  ];

  // 构建数据行
  const rows = variants.map((variant) => {
    const values = [
      variant.sku,
      ...attributeNames.map((attrName) => variant.attributes[attrName] || ''),
      variant.price.toString(),
      variant.comparePrice?.toString() || '',
      variant.stock.toString(),
      variant.images?.join(',') || '',
      variant.isActive ? 'true' : 'false',
    ];

    // 处理包含逗号的值（用引号包裹）
    return values.map((v) => (v.includes(',') ? `"${v}"` : v)).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * 下载 CSV 文件
 */
export const downloadCSV = (csvContent: string, filename: string = 'variants.csv') => {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

