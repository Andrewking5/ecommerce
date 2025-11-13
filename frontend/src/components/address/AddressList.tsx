import React from 'react';
import { UserAddress } from '@/types/address';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Edit, Trash2, MapPin, Star, Home, Building2, School, Tag } from 'lucide-react';

interface AddressListProps {
  addresses: UserAddress[];
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isLoading?: boolean;
}

const getLabelIcon = (label?: string) => {
  switch (label) {
    case '家':
      return <Home size={16} />;
    case '公司':
      return <Building2 size={16} />;
    case '学校':
      return <School size={16} />;
    default:
      return <Tag size={16} />;
  }
};

const AddressList: React.FC<AddressListProps> = ({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">还没有保存的地址</p>
        <p className="text-sm text-gray-500">添加地址后，结账时可以直接选择</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <Card
          key={address.id}
          className={`p-6 relative ${
            address.isDefault ? 'border-2 border-black' : 'border border-gray-200'
          }`}
        >
          {/* 默认地址标识 */}
          {address.isDefault && (
            <div className="absolute top-4 right-4 flex items-center space-x-1 text-black">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">默认</span>
            </div>
          )}

          {/* 地址标签 */}
          {address.label && (
            <div className="flex items-center space-x-1 text-gray-600 mb-2">
              {getLabelIcon(address.label)}
              <span className="text-sm">{address.label}</span>
            </div>
          )}

          {/* 收件人信息 */}
          <div className="mb-3">
            <p className="font-semibold text-lg">{address.recipientName}</p>
            <p className="text-sm text-gray-600">{address.phone}</p>
          </div>

          {/* 地址信息 */}
          <div className="text-gray-700 mb-4">
            <p className="text-sm leading-relaxed">
              {address.province}
              {address.city}
              {address.district}
              {address.street}
            </p>
            {address.zipCode && (
              <p className="text-xs text-gray-500 mt-1">邮编：{address.zipCode}</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(address)}
              className="flex-1"
            >
              <Edit size={16} className="mr-1" />
              编辑
            </Button>
            {!address.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(address.id)}
                className="flex-1"
              >
                <Star size={16} className="mr-1" />
                设为默认
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(address.id)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AddressList;

