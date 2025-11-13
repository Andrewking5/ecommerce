import React from 'react';
import { Package, ShoppingCart, Search, FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'package' | 'cart' | 'search' | 'file';
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const iconMap = {
  package: Package,
  cart: ShoppingCart,
  search: Search,
  file: FileX,
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'package',
  title,
  description,
  action,
  className = '',
}) => {
  const IconComponent = iconMap[icon];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="mb-4 p-4 rounded-full bg-gray-100">
        <IconComponent size={48} className="text-text-tertiary" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary text-center max-w-md mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;

