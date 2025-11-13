// 省市区数据 - 支持中国、台湾等地区

export interface Region {
  code: string;
  name: string;
  children?: Region[];
}

// 中国省市区数据（简化版，实际应使用完整数据）
export const chinaRegions: Region[] = [
  {
    code: '110000',
    name: '北京市',
    children: [
      {
        code: '110100',
        name: '北京市',
        children: [
          { code: '110101', name: '东城区' },
          { code: '110102', name: '西城区' },
          { code: '110105', name: '朝阳区' },
          { code: '110106', name: '丰台区' },
          { code: '110107', name: '石景山区' },
          { code: '110108', name: '海淀区' },
          { code: '110109', name: '门头沟区' },
          { code: '110111', name: '房山区' },
          { code: '110112', name: '通州区' },
          { code: '110113', name: '顺义区' },
          { code: '110114', name: '昌平区' },
          { code: '110115', name: '大兴区' },
          { code: '110116', name: '怀柔区' },
          { code: '110117', name: '平谷区' },
          { code: '110118', name: '密云区' },
          { code: '110119', name: '延庆区' },
        ],
      },
    ],
  },
  {
    code: '310000',
    name: '上海市',
    children: [
      {
        code: '310100',
        name: '上海市',
        children: [
          { code: '310101', name: '黄浦区' },
          { code: '310104', name: '徐汇区' },
          { code: '310105', name: '长宁区' },
          { code: '310106', name: '静安区' },
          { code: '310107', name: '普陀区' },
          { code: '310109', name: '虹口区' },
          { code: '310110', name: '杨浦区' },
          { code: '310112', name: '闵行区' },
          { code: '310113', name: '宝山区' },
          { code: '310114', name: '嘉定区' },
          { code: '310115', name: '浦东新区' },
          { code: '310116', name: '金山区' },
          { code: '310117', name: '松江区' },
          { code: '310118', name: '青浦区' },
          { code: '310120', name: '奉贤区' },
          { code: '310151', name: '崇明区' },
        ],
      },
    ],
  },
  {
    code: '440000',
    name: '广东省',
    children: [
      {
        code: '440100',
        name: '广州市',
        children: [
          { code: '440103', name: '荔湾区' },
          { code: '440104', name: '越秀区' },
          { code: '440105', name: '海珠区' },
          { code: '440106', name: '天河区' },
          { code: '440111', name: '白云区' },
          { code: '440112', name: '黄埔区' },
          { code: '440113', name: '番禺区' },
          { code: '440114', name: '花都区' },
          { code: '440115', name: '南沙区' },
          { code: '440117', name: '从化区' },
          { code: '440118', name: '增城区' },
        ],
      },
      {
        code: '440300',
        name: '深圳市',
        children: [
          { code: '440303', name: '罗湖区' },
          { code: '440304', name: '福田区' },
          { code: '440305', name: '南山区' },
          { code: '440306', name: '宝安区' },
          { code: '440307', name: '龙岗区' },
          { code: '440308', name: '盐田区' },
          { code: '440309', name: '龙华区' },
          { code: '440310', name: '坪山区' },
          { code: '440311', name: '光明区' },
        ],
      },
    ],
  },
  {
    code: '710000',
    name: '台湾省',
    children: [
      {
        code: '710100',
        name: '台北市',
        children: [
          { code: '710101', name: '中正区' },
          { code: '710102', name: '大同区' },
          { code: '710103', name: '中山区' },
          { code: '710104', name: '松山区' },
          { code: '710105', name: '大安区' },
          { code: '710106', name: '万华区' },
          { code: '710107', name: '信义区' },
          { code: '710108', name: '士林区' },
          { code: '710109', name: '北投区' },
          { code: '710110', name: '内湖区' },
          { code: '710111', name: '南港区' },
          { code: '710112', name: '文山区' },
        ],
      },
      {
        code: '710200',
        name: '新北市',
        children: [
          { code: '710201', name: '板桥区' },
          { code: '710202', name: '三重区' },
          { code: '710203', name: '中和区' },
          { code: '710204', name: '永和区' },
          { code: '710205', name: '新庄区' },
          { code: '710206', name: '新店区' },
          { code: '710207', name: '树林区' },
          { code: '710208', name: '莺歌区' },
          { code: '710209', name: '三峡区' },
          { code: '710210', name: '淡水区' },
          { code: '710211', name: '汐止区' },
          { code: '710212', name: '瑞芳区' },
          { code: '710213', name: '土城区' },
          { code: '710214', name: '芦洲区' },
          { code: '710215', name: '五股区' },
          { code: '710216', name: '泰山区' },
          { code: '710217', name: '林口区' },
          { code: '710218', name: '深坑区' },
          { code: '710219', name: '石碇区' },
          { code: '710220', name: '坪林区' },
          { code: '710221', name: '三芝区' },
          { code: '710222', name: '石门区' },
          { code: '710223', name: '八里区' },
          { code: '710224', name: '平溪区' },
          { code: '710225', name: '双溪区' },
          { code: '710226', name: '贡寮区' },
          { code: '710227', name: '金山区' },
          { code: '710228', name: '万里区' },
          { code: '710229', name: '乌来区' },
        ],
      },
      {
        code: '710300',
        name: '桃园市',
        children: [
          { code: '710301', name: '桃园区' },
          { code: '710302', name: '中坜区' },
          { code: '710303', name: '大溪区' },
          { code: '710304', name: '杨梅区' },
          { code: '710305', name: '芦竹区' },
          { code: '710306', name: '大园区' },
          { code: '710307', name: '龟山区' },
          { code: '710308', name: '八德区' },
          { code: '710309', name: '龙潭区' },
          { code: '710310', name: '平镇区' },
          { code: '710311', name: '新屋区' },
          { code: '710312', name: '观音区' },
          { code: '710313', name: '复兴区' },
        ],
      },
      {
        code: '710400',
        name: '台中市',
        children: [
          { code: '710401', name: '中区' },
          { code: '710402', name: '东区' },
          { code: '710403', name: '南区' },
          { code: '710404', name: '西区' },
          { code: '710405', name: '北区' },
          { code: '710406', name: '西屯区' },
          { code: '710407', name: '南屯区' },
          { code: '710408', name: '北屯区' },
          { code: '710409', name: '丰原区' },
          { code: '710410', name: '东势区' },
          { code: '710411', name: '大甲区' },
          { code: '710412', name: '清水区' },
          { code: '710413', name: '沙鹿区' },
          { code: '710414', name: '梧栖区' },
          { code: '710415', name: '后里区' },
          { code: '710416', name: '神冈区' },
          { code: '710417', name: '潭子区' },
          { code: '710418', name: '大雅区' },
          { code: '710419', name: '新社区' },
          { code: '710420', name: '石冈区' },
          { code: '710421', name: '外埔区' },
          { code: '710422', name: '大安区' },
          { code: '710423', name: '乌日区' },
          { code: '710424', name: '大肚区' },
          { code: '710425', name: '龙井区' },
          { code: '710426', name: '雾峰区' },
          { code: '710427', name: '太平区' },
          { code: '710428', name: '大里区' },
          { code: '710429', name: '和平区' },
        ],
      },
      {
        code: '710500',
        name: '台南市',
        children: [
          { code: '710501', name: '中西区' },
          { code: '710502', name: '东区' },
          { code: '710503', name: '南区' },
          { code: '710504', name: '北区' },
          { code: '710505', name: '安平区' },
          { code: '710506', name: '安南区' },
          { code: '710507', name: '永康区' },
          { code: '710508', name: '归仁区' },
          { code: '710509', name: '新化区' },
          { code: '710510', name: '左镇区' },
          { code: '710511', name: '玉井区' },
          { code: '710512', name: '楠西区' },
          { code: '710513', name: '南化区' },
          { code: '710514', name: '仁德区' },
          { code: '710515', name: '关庙区' },
          { code: '710516', name: '龙崎区' },
          { code: '710517', name: '官田区' },
          { code: '710518', name: '麻豆区' },
          { code: '710519', name: '佳里区' },
          { code: '710520', name: '西港区' },
          { code: '710521', name: '七股区' },
          { code: '710522', name: '将军区' },
          { code: '710523', name: '学甲区' },
          { code: '710524', name: '北门区' },
          { code: '710525', name: '新营区' },
          { code: '710526', name: '后壁区' },
          { code: '710527', name: '白河区' },
          { code: '710528', name: '东山区' },
          { code: '710529', name: '六甲区' },
          { code: '710530', name: '下营区' },
          { code: '710531', name: '柳营区' },
          { code: '710532', name: '盐水区' },
          { code: '710533', name: '善化区' },
          { code: '710534', name: '大内区' },
          { code: '710535', name: '山上区' },
          { code: '710536', name: '新市区' },
          { code: '710537', name: '安定区' },
        ],
      },
      {
        code: '710600',
        name: '高雄市',
        children: [
          { code: '710601', name: '新兴区' },
          { code: '710602', name: '前金区' },
          { code: '710603', name: '苓雅区' },
          { code: '710604', name: '盐埕区' },
          { code: '710605', name: '鼓山区' },
          { code: '710606', name: '旗津区' },
          { code: '710607', name: '前镇区' },
          { code: '710608', name: '三民区' },
          { code: '710609', name: '左营区' },
          { code: '710610', name: '楠梓区' },
          { code: '710611', name: '小港区' },
          { code: '710612', name: '凤山区' },
          { code: '710613', name: '林园区' },
          { code: '710614', name: '大寮区' },
          { code: '710615', name: '大树区' },
          { code: '710616', name: '大社区' },
          { code: '710617', name: '仁武区' },
          { code: '710618', name: '鸟松区' },
          { code: '710619', name: '冈山区' },
          { code: '710620', name: '桥头区' },
          { code: '710621', name: '燕巢区' },
          { code: '710622', name: '田寮区' },
          { code: '710623', name: '阿莲区' },
          { code: '710624', name: '路竹区' },
          { code: '710625', name: '湖内区' },
          { code: '710626', name: '茄萣区' },
          { code: '710627', name: '永安区' },
          { code: '710628', name: '弥陀区' },
          { code: '710629', name: '梓官区' },
          { code: '710630', name: '旗山区' },
          { code: '710631', name: '美浓区' },
          { code: '710632', name: '六龟区' },
          { code: '710633', name: '甲仙区' },
          { code: '710634', name: '杉林区' },
          { code: '710635', name: '内门区' },
          { code: '710636', name: '茂林区' },
          { code: '710637', name: '桃源区' },
          { code: '710638', name: '那玛夏区' },
        ],
      },
    ],
  },
];

// 获取省份列表
export const getProvinces = (): Region[] => {
  return chinaRegions.map((region) => ({
    code: region.code,
    name: region.name,
  }));
};

// 根据省份代码获取城市列表
export const getCitiesByProvince = (provinceCode: string): Region[] => {
  const province = chinaRegions.find((r) => r.code === provinceCode);
  if (!province || !province.children) return [];
  return province.children.map((city) => ({
    code: city.code,
    name: city.name,
  }));
};

// 根据城市代码获取区县列表
export const getDistrictsByCity = (provinceCode: string, cityCode: string): Region[] => {
  const province = chinaRegions.find((r) => r.code === provinceCode);
  if (!province || !province.children) return [];
  const city = province.children.find((c) => c.code === cityCode);
  if (!city || !city.children) return [];
  return city.children;
};

// 根据代码获取名称
export const getRegionName = (code: string): string => {
  for (const province of chinaRegions) {
    if (province.code === code) return province.name;
    if (province.children) {
      for (const city of province.children) {
        if (city.code === code) return city.name;
        if (city.children) {
          for (const district of city.children) {
            if (district.code === code) return district.name;
          }
        }
      }
    }
  }
  return '';
};

