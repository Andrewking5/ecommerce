import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${variantStyles[variant]}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-sm text-text-secondary">{message}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'primary' : 'primary'}
            onClick={onConfirm}
            className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

