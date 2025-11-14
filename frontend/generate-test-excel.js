import XLSX from 'xlsx';

// 创建测试数据 - 20个Apple产品，包含不同情况
const testData = [
  // 有变体的商品 - iPhone 15 Pro（3个变体）
  {
    商品名称: 'iPhone 15 Pro',
    商品描述: 'Apple最新旗舰手机，采用A17 Pro芯片，钛金属材质，支持ProRes视频录制',
    分类: 'Electronics',
    价格: 999.00,
    库存: 50,
    图片URL: 'https://example.com/iphone15pro.jpg',
    是否启用: true,
    颜色: '深空黑色',
    存储容量: '256GB'
  },
  {
    商品名称: 'iPhone 15 Pro',
    商品描述: '',
    分类: '',
    价格: 999.00,
    库存: 30,
    图片URL: '',
    是否启用: '',
    颜色: '原色钛金属',
    存储容量: '256GB'
  },
  {
    商品名称: 'iPhone 15 Pro',
    商品描述: '',
    分类: '',
    价格: 1149.00,
    库存: 25,
    图片URL: '',
    是否启用: '',
    颜色: '深空黑色',
    存储容量: '512GB'
  },
  
  // 有变体的商品 - iPhone 15（2个变体）
  {
    商品名称: 'iPhone 15',
    商品描述: 'Apple标准版iPhone，配备A16芯片，6.1英寸Super Retina XDR显示屏',
    分类: 'Electronics',
    价格: 799.00,
    库存: 80,
    图片URL: 'https://example.com/iphone15.jpg',
    是否启用: true,
    颜色: '粉色',
    存储容量: '128GB'
  },
  {
    商品名称: 'iPhone 15',
    商品描述: '',
    分类: '',
    价格: 899.00,
    库存: 60,
    图片URL: '',
    是否启用: '',
    颜色: '蓝色',
    存储容量: '256GB'
  },
  
  // 有变体的商品 - MacBook Pro 14英寸（2个变体）
  {
    商品名称: 'MacBook Pro 14英寸',
    商品描述: '配备M3芯片的14英寸MacBook Pro，专业级性能，适合创意工作者',
    分类: 'Electronics',
    价格: 1999.00,
    库存: 20,
    图片URL: 'https://example.com/mbp14.jpg',
    是否启用: true,
    颜色: '深空灰色',
    存储容量: '512GB'
  },
  {
    商品名称: 'MacBook Pro 14英寸',
    商品描述: '',
    分类: '',
    价格: 2499.00,
    库存: 15,
    图片URL: '',
    是否启用: '',
    颜色: '深空灰色',
    存储容量: '1TB'
  },
  
  // 有变体的商品 - MacBook Air 13英寸（2个变体）
  {
    商品名称: 'MacBook Air 13英寸',
    商品描述: '轻薄便携的MacBook Air，配备M2芯片，13.6英寸Liquid Retina显示屏',
    分类: 'Electronics',
    价格: 1199.00,
    库存: 40,
    图片URL: 'https://example.com/mba13.jpg',
    是否启用: true,
    颜色: '午夜色',
    存储容量: '256GB'
  },
  {
    商品名称: 'MacBook Air 13英寸',
    商品描述: '',
    分类: '',
    价格: 1399.00,
    库存: 35,
    图片URL: '',
    是否启用: '',
    颜色: '星光色',
    存储容量: '512GB'
  },
  
  // 有变体的商品 - iPad Pro 12.9英寸（2个变体）
  {
    商品名称: 'iPad Pro 12.9英寸',
    商品描述: '配备M2芯片的12.9英寸iPad Pro，专业创作工具，支持Apple Pencil',
    分类: 'Electronics',
    价格: 1099.00,
    库存: 30,
    图片URL: 'https://example.com/ipadpro129.jpg',
    是否启用: true,
    颜色: '深空灰色',
    存储容量: '256GB'
  },
  {
    商品名称: 'iPad Pro 12.9英寸',
    商品描述: '',
    分类: '',
    价格: 1299.00,
    库存: 25,
    图片URL: '',
    是否启用: '',
    颜色: '银色',
    存储容量: '512GB'
  },
  
  // 无变体的商品 - AirPods Pro
  {
    商品名称: 'AirPods Pro (第2代)',
    商品描述: '主动降噪无线耳机，配备USB-C充电盒，支持空间音频和自适应音频',
    分类: 'Electronics',
    价格: 249.00,
    库存: 100,
    图片URL: 'https://example.com/airpodspro2.jpg',
    是否启用: true
  },
  
  // 无变体的商品 - AirPods
  {
    商品名称: 'AirPods (第3代)',
    商品描述: '空间音频无线耳机，MagSafe充电盒，支持动态头部追踪',
    分类: 'Electronics',
    价格: 179.00,
    库存: 150,
    图片URL: 'https://example.com/airpods3.jpg',
    是否启用: true
  },
  
  // 有变体的商品 - Apple Watch Series 9（3个变体）
  {
    商品名称: 'Apple Watch Series 9',
    商品描述: '最新款Apple Watch，配备S9芯片，支持手势控制，45mm表壳',
    分类: 'Electronics',
    价格: 429.00,
    库存: 60,
    图片URL: 'https://example.com/watch9.jpg',
    是否启用: true,
    颜色: '午夜色',
    表壳尺寸: '45mm'
  },
  {
    商品名称: 'Apple Watch Series 9',
    商品描述: '',
    分类: '',
    价格: 429.00,
    库存: 50,
    图片URL: '',
    是否启用: '',
    颜色: '星光色',
    表壳尺寸: '45mm'
  },
  {
    商品名称: 'Apple Watch Series 9',
    商品描述: '',
    分类: '',
    价格: 379.00,
    库存: 40,
    图片URL: '',
    是否启用: '',
    颜色: '午夜色',
    表壳尺寸: '41mm'
  },
  
  // 无变体的商品 - MagSafe充电器
  {
    商品名称: 'MagSafe充电器',
    商品描述: 'Apple官方MagSafe无线充电器，支持iPhone和AirPods，最大15W功率',
    分类: 'Electronics',
    价格: 39.00,
    库存: 200,
    图片URL: 'https://example.com/magsafe.jpg',
    是否启用: true
  },
  
  // 无变体的商品 - Lightning转USB-C数据线
  {
    商品名称: 'Lightning转USB-C数据线',
    商品描述: '1米长Lightning转USB-C数据线，支持快速充电和数据传输',
    分类: 'Electronics',
    价格: 19.00,
    库存: 300,
    图片URL: 'https://example.com/cable.jpg',
    是否启用: true
  },
  
  // 有变体的商品 - iPhone保护壳（2个变体）
  {
    商品名称: 'iPhone保护壳',
    商品描述: '透明硅胶保护壳，适用于iPhone 15系列，防摔防刮',
    分类: 'Electronics',
    价格: 49.00,
    库存: 250,
    图片URL: 'https://example.com/case.jpg',
    是否启用: true,
    颜色: '透明'
  },
  {
    商品名称: 'iPhone保护壳',
    商品描述: '',
    分类: '',
    价格: 49.00,
    库存: 200,
    图片URL: '',
    是否启用: '',
    颜色: '黑色'
  },
  
  // 无变体的商品 - Apple Pencil
  {
    商品名称: 'Apple Pencil (第2代)',
    商品描述: '适用于iPad Pro和iPad Air的Apple Pencil，支持压感和倾斜感应',
    分类: 'Electronics',
    价格: 129.00,
    库存: 80,
    图片URL: 'https://example.com/pencil2.jpg',
    是否启用: true
  },
  
  // 无变体的商品 - Magic Keyboard
  {
    商品名称: 'Magic Keyboard',
    商品描述: '适用于iPad Pro的Magic Keyboard，带触控板和背光键盘',
    分类: 'Electronics',
    价格: 349.00,
    库存: 45,
    图片URL: 'https://example.com/keyboard.jpg',
    是否启用: true
  },
  
  // 无变体的商品 - HomePod mini
  {
    商品名称: 'HomePod mini',
    商品描述: '智能音箱，支持Siri语音控制，360度音频，多种颜色可选',
    分类: 'Electronics',
    价格: 99.00,
    库存: 120,
    图片URL: 'https://example.com/homepod.jpg',
    是否启用: true
  }
];

// 创建工作簿
const wb = XLSX.utils.book_new();

// 创建工作表
const ws = XLSX.utils.json_to_sheet(testData);

// 设置列宽
ws['!cols'] = [
  { wch: 30 }, // 商品名称
  { wch: 50 }, // 商品描述
  { wch: 18 }, // 分类
  { wch: 14 }, // 价格
  { wch: 12 }, // 库存
  { wch: 60 }, // 图片URL
  { wch: 14 }, // 是否启用
  { wch: 15 }, // 颜色
  { wch: 18 }, // 存储容量
  { wch: 15 }, // 表壳尺寸
];

// 设置行高（表头）
if (!ws['!rows']) {
  ws['!rows'] = [];
}
ws['!rows'][0] = { hpt: 20 };

// 冻结第一行
ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

// 添加自动筛选
if (ws['!ref']) {
  ws['!autofilter'] = { ref: ws['!ref'] };
}

// 将工作表添加到工作簿
XLSX.utils.book_append_sheet(wb, ws, '商品数据');

// 保存文件
XLSX.writeFile(wb, 'Apple产品测试数据.xlsx');

console.log('✅ Excel测试文件已生成: Apple产品测试数据.xlsx');
console.log(`📊 包含 ${testData.length} 行数据`);
console.log('📦 商品类型：');
console.log('   - iPhone 15 Pro (3个变体)');
console.log('   - iPhone 15 (2个变体)');
console.log('   - MacBook Pro 14英寸 (2个变体)');
console.log('   - MacBook Air 13英寸 (2个变体)');
console.log('   - iPad Pro 12.9英寸 (2个变体)');
console.log('   - Apple Watch Series 9 (3个变体)');
console.log('   - iPhone保护壳 (2个变体)');
console.log('   - 以及多个无变体商品');
console.log('\n💡 测试场景：');
console.log('   - 有变体商品（相同商品名称，不同属性）');
console.log('   - 无变体商品（每行独立商品）');
console.log('   - 不同价格和库存');
console.log('   - 不同分类（全部为Electronics）');

