import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface ProductSpecificationsProps {
  specifications: Record<string, any>;
  onChange: (specifications: Record<string, any>) => void;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  specifications,
  onChange,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) {
      return;
    }

    onChange({
      ...specifications,
      [newKey.trim()]: newValue.trim(),
    });

    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (key: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    onChange(newSpecs);
  };

  const handleUpdate = (key: string, value: string) => {
    onChange({
      ...specifications,
      [key]: value,
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('admin:products.specifications', { defaultValue: '规格参数' })}
      </h3>

      {/* 现有规格列表 */}
      <div className="space-y-2 mb-4">
        {Object.entries(specifications || {}).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 p-2 border rounded-lg">
            <Input
              value={key}
              onChange={(e) => {
                const newSpecs = { ...specifications };
                delete newSpecs[key];
                newSpecs[e.target.value] = value;
                onChange(newSpecs);
              }}
              className="flex-1"
            />
            <span className="text-text-tertiary">:</span>
            <Input
              value={String(value)}
              onChange={(e) => handleUpdate(key, e.target.value)}
              className="flex-1"
            />
            <button
              onClick={() => handleRemove(key)}
              className="p-1 text-red-600 hover:text-red-700"
              aria-label={t('common:delete', { defaultValue: '删除' })}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* 添加新规格 */}
      <div className="flex gap-2">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder={t('admin:products.specKey', { defaultValue: '规格名称' })}
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAdd();
            }
          }}
        />
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={t('admin:products.specValue', { defaultValue: '规格值' })}
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAdd();
            }
          }}
        />
        <Button
          onClick={handleAdd}
          aria-label={t('common:add', { defaultValue: '添加' })}
        >
          <Plus size={16} />
        </Button>
      </div>
    </Card>
  );
};

export default ProductSpecifications;

