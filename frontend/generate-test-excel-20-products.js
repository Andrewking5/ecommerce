import XLSX from 'xlsx';

/**
 * 20个产品测试数据生成脚本
 * 
 * 重要提示：
 * 1. 请根据您系统中的实际分类名称修改"分类"列的值
 * 2. 如果分类不存在，系统会显示验证错误
 * 3. 您可以在管理后台先创建分类，或者修改Excel中的分类名称
 * 4. 分类支持三种方式：分类名称、分类slug或分类ID
 */

// 20个产品的测试数据
// 注意：分类名称需要根据您的系统实际情况修改
const testData = [
  // ========== 有变体的商品 ==========
  
  // 1-3. iPhone 15 Pro（3个变体：不同存储容量和颜色）
  {
    商品名称: 'iPhone 15 Pro',
    商品描述: 'Apple iPhone 15 Pro，采用钛金属设计，配备A17 Pro芯片，支持ProRes视频录制',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 8999,
    库存: 0, // 变体商品总库存为0
    图片URL: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop',
    是否启用: true,
    颜色: '深空黑色',
    存储容量: '128GB'
  },
  {
    商品名称: 'iPhone 15 Pro',
    商品描述: '',
    分类: '',
    价格: 8999,
    库存: 50,
    图片URL: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
    是否启用: true,
    颜色: '蓝色钛金属',
    存储容量: '128GB'
  },
  {
    商品名称: 'iPhone 15 Pro',
    商品描述: '',
    分类: '',
    价格: 10999,
    库存: 30,
    图片URL: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop',
    是否启用: true,
    颜色: '深空黑色',
    存储容量: '256GB'
  },
  
  // 4-5. 运动T恤（2个变体：不同颜色和尺寸）
  {
    商品名称: '运动T恤',
    商品描述: '100%纯棉运动T恤，透气舒适，适合日常运动和休闲穿着',
    分类: 'Clothing', // ⚠️ 请修改为系统中的实际分类名称
    价格: 99,
    库存: 0,
    图片URL: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    是否启用: true,
    颜色: '黑色',
    尺寸: 'M'
  },
  {
    商品名称: '运动T恤',
    商品描述: '',
    分类: '',
    价格: 99,
    库存: 45,
    图片URL: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
    是否启用: true,
    颜色: '白色',
    尺寸: 'L'
  },
  
  // 6-8. 无线耳机（3个变体：不同颜色）
  {
    商品名称: '无线蓝牙耳机',
    商品描述: '真无线蓝牙耳机，主动降噪，续航30小时，支持快充',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 299,
    库存: 0,
    图片URL: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=800&fit=crop',
    是否启用: true,
    颜色: '黑色'
  },
  {
    商品名称: '无线蓝牙耳机',
    商品描述: '',
    分类: '',
    价格: 299,
    库存: 80,
    图片URL: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop',
    是否启用: true,
    颜色: '白色'
  },
  {
    商品名称: '无线蓝牙耳机',
    商品描述: '',
    分类: '',
    价格: 299,
    库存: 60,
    图片URL: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    是否启用: true,
    颜色: '蓝色'
  },
  
  // ========== 无变体的商品 ==========
  
  // 9. 笔记本电脑
  {
    商品名称: 'MacBook Pro 14英寸',
    商品描述: 'Apple M3芯片，14英寸Liquid Retina XDR显示屏，18小时电池续航',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 14999,
    库存: 25,
    图片URL: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 10. 智能手表
  {
    商品名称: 'Apple Watch Series 9',
    商品描述: '45mm表壳，GPS+蜂窝网络，全天候健康监测，S9芯片',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 3199,
    库存: 40,
    图片URL: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 11. 平板电脑
  {
    商品名称: 'iPad Air 11英寸',
    商品描述: 'M2芯片，11英寸Liquid Retina显示屏，支持Apple Pencil，多种颜色可选',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 4799,
    库存: 35,
    图片URL: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 12. 键盘
  {
    商品名称: '机械键盘',
    商品描述: '87键机械键盘，青轴，RGB背光，支持多设备连接',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 499,
    库存: 100,
    图片URL: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 13. 鼠标
  {
    商品名称: '无线鼠标',
    商品描述: '2.4GHz无线连接，人体工学设计，续航12个月，支持多设备切换',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 199,
    库存: 150,
    图片URL: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 14. 显示器
  {
    商品名称: '27英寸4K显示器',
    商品描述: '27英寸4K UHD IPS显示屏，99% sRGB色域，支持Type-C连接',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 2499,
    库存: 20,
    图片URL: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 15. 背包
  {
    商品名称: '商务双肩背包',
    商品描述: '防水尼龙材质，多隔层设计，适合商务出行和日常通勤',
    分类: 'Clothing', // ⚠️ 请修改为系统中的实际分类名称
    价格: 299,
    库存: 60,
    图片URL: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 16. 运动鞋
  {
    商品名称: '跑步运动鞋',
    商品描述: '轻量缓震跑鞋，透气网面，防滑橡胶大底，适合日常跑步训练',
    分类: 'Clothing', // ⚠️ 请修改为系统中的实际分类名称
    价格: 599,
    库存: 80,
    图片URL: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 17. 水杯
  {
    商品名称: '保温杯500ml',
    商品描述: '304不锈钢内胆，24小时保温，一键开盖，多种颜色可选',
    分类: 'Home & Living', // ⚠️ 请修改为系统中的实际分类名称
    价格: 89,
    库存: 200,
    图片URL: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 18. 台灯
  {
    商品名称: '护眼台灯',
    商品描述: 'LED护眼台灯，无频闪，多档调光，触摸开关，适合学习和办公',
    分类: 'Home & Living', // ⚠️ 请修改为系统中的实际分类名称
    价格: 199,
    库存: 120,
    图片URL: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 19. 充电宝
  {
    商品名称: '20000mAh移动电源',
    商品描述: '20000mAh大容量，支持快充，双USB输出，Type-C输入，适合长途旅行',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 149,
    库存: 90,
    图片URL: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c0?w=800&h=800&fit=crop',
    是否启用: true
  },
  
  // 20. 数据线
  {
    商品名称: 'USB-C数据线',
    商品描述: '1米USB-C to USB-C数据线，支持100W快充，数据传输，编织线材',
    分类: 'Electronics', // ⚠️ 请修改为系统中的实际分类名称
    价格: 49,
    库存: 300,
    图片URL: 'https://images.unsplash.com/photo-1587825147130-7b5b0c0c0c0c?w=800&h=800&fit=crop',
    是否启用: true
  }
];

// 创建工作簿
const wb = XLSX.utils.book_new();

// 创建工作表
const ws = XLSX.utils.json_to_sheet(testData);

// 设置列宽
ws['!cols'] = [
  { wch: 25 }, // 商品名称
  { wch: 60 }, // 商品描述
  { wch: 12 }, // 价格
  { wch: 15 }, // 分类
  { wch: 10 }, // 库存
  { wch: 50 }, // 图片URL
  { wch: 12 }, // 是否启用
  { wch: 12 }, // 颜色
  { wch: 15 }, // 尺寸
  { wch: 15 }, // 存储容量
];

// 设置行高（表头）
if (!ws['!rows']) {
  ws['!rows'] = [];
}
ws['!rows'][0] = { hpt: 20 }; // 表头行高

// 将工作表添加到工作簿
XLSX.utils.book_append_sheet(wb, ws, '商品数据');

// 保存文件
const filename = '20个产品测试数据.xlsx';
XLSX.writeFile(wb, filename);

console.log(`✅ Excel测试文件已生成: ${filename}`);
console.log(`📊 包含 ${testData.length} 行数据`);
console.log(`📦 其中：`);
console.log(`   - 有变体商品：3个（iPhone 15 Pro、运动T恤、无线蓝牙耳机）`);
console.log(`   - 无变体商品：12个`);
console.log(`   - 总计：20行数据`);

