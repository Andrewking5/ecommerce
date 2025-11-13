import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ProductAttribute } from '@/types/variant';

interface AttributeValuesEditorProps {
  attributes: ProductAttribute[];
  attributeValues: Record<string, string[]>;
  onAddValue: (attributeId: string, value: string) => void;
  onRemoveValue: (attributeId: string, value: string) => void;
}

const AttributeValuesEditor: React.FC<AttributeValuesEditorProps> = ({
  attributes,
  attributeValues,
  onAddValue,
  onRemoveValue,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [newValues, setNewValues] = useState<Record<string, string>>({});

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-4">
        {t('admin:attributes.configureValues', { defaultValue: '配置属性值' })}
      </h4>
      <div className="space-y-4">
        {attributes.map((attr) => {
          const values = attributeValues[attr.id] || [];
          const newValue = newValues[attr.id] || '';

          return (
            <div key={attr.id} className="border rounded-lg p-4">
              <div className="font-medium mb-2">{attr.displayName || attr.name}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {values.map((value) => (
                  <span
                    key={value}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => onRemoveValue(attr.id, value)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label={`删除 ${value}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValues({ ...newValues, [attr.id]: e.target.value })}
                  placeholder={t('admin:attributes.addValue', { defaultValue: '添加值' })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onAddValue(attr.id, newValue);
                      setNewValues({ ...newValues, [attr.id]: '' });
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    onAddValue(attr.id, newValue);
                    setNewValues({ ...newValues, [attr.id]: '' });
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AttributeValuesEditor;

