import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserAddress, CreateAddressRequest, AddressLabel } from '@/types/address';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import RegionSelector from './RegionSelector';

const addressSchema = z.object({
  recipientName: z.string().min(2, '收件人姓名至少2个字符').max(50, '收件人姓名不能超过50个字符'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, '电话号码格式不正确'),
  province: z.string().min(1, '请选择省份'),
  city: z.string().min(1, '请选择城市'),
  district: z.string().min(1, '请选择区县'),
  street: z.string().min(5, '详细地址至少5个字符').max(200, '详细地址不能超过200个字符'),
  zipCode: z.string().regex(/^[0-9]{5,10}$/).optional().or(z.literal('')),
  label: z.string().max(20).optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

interface AddressFormProps {
  defaultValues?: UserAddress;
  onSubmit: (data: CreateAddressRequest) => void;
  onCancel?: () => void;
  title?: string;
  buttonText?: string;
  showDefaultOption?: boolean;
}

const ADDRESS_LABELS: AddressLabel[] = ['家', '公司', '学校', '其他'];

const AddressForm: React.FC<AddressFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  title = '地址信息',
  buttonText = '保存',
  showDefaultOption = true,
}) => {
  const [selectedLabel, setSelectedLabel] = useState<string>(
    defaultValues?.label || ''
  );
  const [customLabel, setCustomLabel] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(
    defaultValues?.isDefault || false
  );
  const [province, setProvince] = useState<string>(defaultValues?.province || '');
  const [city, setCity] = useState<string>(defaultValues?.city || '');
  const [district, setDistrict] = useState<string>(defaultValues?.district || '');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateAddressRequest>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues
      ? {
          recipientName: defaultValues.recipientName,
          phone: defaultValues.phone,
          province: defaultValues.province,
          city: defaultValues.city,
          district: defaultValues.district,
          street: defaultValues.street,
          zipCode: defaultValues.zipCode || '',
          label: defaultValues.label || '',
          isDefault: defaultValues.isDefault,
        }
      : {
          recipientName: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          street: '',
          zipCode: '',
          label: '',
          isDefault: false,
        },
  });

  // 同步省市区到表单
  React.useEffect(() => {
    setValue('province', province);
  }, [province, setValue]);

  React.useEffect(() => {
    setValue('city', city);
  }, [city, setValue]);

  React.useEffect(() => {
    setValue('district', district);
  }, [district, setValue]);

  const handleFormSubmit = (data: CreateAddressRequest) => {
    const label = selectedLabel === '其他' ? customLabel : selectedLabel;
    onSubmit({
      ...data,
      province,
      city,
      district,
      label: label || undefined,
      isDefault: showDefaultOption ? isDefault : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {/* 收件人姓名 */}
      <div>
        <label htmlFor="recipientName" className="block text-sm font-medium mb-1">
          收件人姓名 <span className="text-red-500">*</span>
        </label>
        <Input
          id="recipientName"
          {...register('recipientName')}
          error={errors.recipientName?.message}
          placeholder="请输入收件人姓名"
        />
      </div>

      {/* 联系电话 */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          联系电话 <span className="text-red-500">*</span>
        </label>
        <Input
          id="phone"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="请输入联系电话"
        />
      </div>

      {/* 省市区选择 */}
      <RegionSelector
        province={province}
        city={city}
        district={district}
        onProvinceChange={(p) => {
          setProvince(p);
          setCity('');
          setDistrict('');
        }}
        onCityChange={(c) => {
          setCity(c);
          setDistrict('');
        }}
        onDistrictChange={setDistrict}
        errors={{
          province: errors.province?.message,
          city: errors.city?.message,
          district: errors.district?.message,
        }}
      />

      {/* 详细地址 */}
      <div>
        <label htmlFor="street" className="block text-sm font-medium mb-1">
          详细地址 <span className="text-red-500">*</span>
        </label>
        <Input
          id="street"
          {...register('street')}
          error={errors.street?.message}
          placeholder="请输入街道、门牌号等详细地址"
        />
      </div>

      {/* 邮编 */}
      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
          邮编（可选）
        </label>
        <Input
          id="zipCode"
          {...register('zipCode')}
          error={errors.zipCode?.message}
          placeholder="请输入邮编"
        />
      </div>

      {/* 地址标签 */}
      <div>
        <label className="block text-sm font-medium mb-2">地址标签（可选）</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {ADDRESS_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setSelectedLabel(label);
                if (label !== '其他') {
                  setCustomLabel('');
                }
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedLabel === label
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {selectedLabel === '其他' && (
          <Input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="请输入自定义标签"
            maxLength={20}
          />
        )}
      </div>

      {/* 设为默认地址 */}
      {showDefaultOption && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-brand-blue"
          />
          <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
            设为默认地址
          </label>
        </div>
      )}

      {/* 按钮 */}
      <div className="flex space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onCancel}
          >
            取消
          </Button>
        )}
        <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : buttonText}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;

