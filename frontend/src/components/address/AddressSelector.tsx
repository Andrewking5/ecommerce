import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserAddress } from '@/types/address';
import { addressApi } from '@/services/addresses';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AddressForm from './AddressForm';
import { MapPin, Plus, Star, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddressSelectorProps {
  selectedAddressId?: string;
  onSelect: (address: UserAddress) => void;
  onNewAddress?: (address: UserAddress) => void;
  showAddButton?: boolean;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onSelect,
  onNewAddress,
  showAddButton = true,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: addresses = [], isLoading, refetch } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => addressApi.getUserAddresses(),
  });

  const handleAddAddress = async (data: any) => {
    try {
      const newAddress = await addressApi.createAddress(data);
      toast.success('地址添加成功');
      setShowAddForm(false);
      refetch();
      if (onNewAddress) {
        onNewAddress(newAddress);
      }
      onSelect(newAddress);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '添加地址失败');
    }
  };

  if (showAddForm) {
    return (
      <Card className="p-6">
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setShowAddForm(false)}
          title="添加新地址"
          buttonText="保存地址"
        />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="group" aria-label="Address selection">
      {/* 地址列表 */}
      {addresses.length > 0 ? (
        <div className="space-y-3" role="radiogroup" aria-label="Available addresses">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`p-4 cursor-pointer transition-all touch-manipulation ${
                selectedAddressId === address.id
                  ? 'border-2 border-black bg-gray-50'
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelect(address)}
              role="radio"
              aria-checked={selectedAddressId === address.id}
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(address);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star size={12} className="mr-1 fill-yellow-400" />
                        默认
                      </span>
                    )}
                    {address.label && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {address.label}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold mb-1">{address.recipientName}</p>
                  <p className="text-sm text-gray-600 mb-2">{address.phone}</p>
                  <p className="text-sm text-gray-700">
                    {address.province}
                    {address.city}
                    {address.district}
                    {address.street}
                  </p>
                </div>
                {selectedAddressId === address.id && (
                  <div className="ml-4">
                    <Check size={20} className="text-black" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-gray-200 rounded-xl">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">还没有保存的地址</p>
        </div>
      )}

      {/* 添加新地址按钮 */}
      {showAddButton && (
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} className="mr-2" />
          添加新地址
        </Button>
      )}
    </div>
  );
};

export default AddressSelector;

