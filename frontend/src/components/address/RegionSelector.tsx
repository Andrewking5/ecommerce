import React, { useState, useEffect } from 'react';
import { getProvinces, getCitiesByProvince, getDistrictsByCity } from '@/data/regions';

interface RegionSelectorProps {
  province?: string;
  city?: string;
  district?: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  errors?: {
    province?: string;
    city?: string;
    district?: string;
  };
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  province,
  city,
  district,
  onProvinceChange,
  onCityChange,
  onDistrictChange,
  errors,
}) => {
  const [provinces] = useState(getProvinces());
  const [cities, setCities] = useState<Array<{ code: string; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ code: string; name: string }>>([]);

  // 当省份改变时，更新城市列表
  useEffect(() => {
    if (province) {
      const cityList = getCitiesByProvince(province);
      setCities(cityList);
      // 重置城市和区县
      if (city && !cityList.find((c) => c.code === city)) {
        onCityChange('');
        onDistrictChange('');
      }
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [province, city, onCityChange, onDistrictChange]);

  // 当城市改变时，更新区县列表
  useEffect(() => {
    if (province && city) {
      const districtList = getDistrictsByCity(province, city);
      setDistricts(districtList);
      // 重置区县
      if (district && !districtList.find((d) => d.code === district)) {
        onDistrictChange('');
      }
    } else {
      setDistricts([]);
    }
  }, [province, city, district, onDistrictChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 省份选择 */}
      <div>
        <label htmlFor="province" className="block text-sm font-medium mb-1">
          省份 <span className="text-red-500">*</span>
        </label>
        <select
          id="province"
          value={province || ''}
          onChange={(e) => {
            onProvinceChange(e.target.value);
            onCityChange('');
            onDistrictChange('');
          }}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all duration-200 ${
            errors?.province ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">请选择省份</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        {errors?.province && (
          <p className="mt-1 text-sm text-red-600">{errors.province}</p>
        )}
      </div>

      {/* 城市选择 */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium mb-1">
          城市 <span className="text-red-500">*</span>
        </label>
        <select
          id="city"
          value={city || ''}
          onChange={(e) => {
            onCityChange(e.target.value);
            onDistrictChange('');
          }}
          disabled={!province || cities.length === 0}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all duration-200 ${
            errors?.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          } ${!province || cities.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">请选择城市</option>
          {cities.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        {errors?.city && (
          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
        )}
      </div>

      {/* 区县选择 */}
      <div>
        <label htmlFor="district" className="block text-sm font-medium mb-1">
          区县 <span className="text-red-500">*</span>
        </label>
        <select
          id="district"
          value={district || ''}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!city || districts.length === 0}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all duration-200 ${
            errors?.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          } ${!city || districts.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">请选择区县</option>
          {districts.map((d) => (
            <option key={d.code} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        {errors?.district && (
          <p className="mt-1 text-sm text-red-600">{errors.district}</p>
        )}
      </div>
    </div>
  );
};

export default RegionSelector;

