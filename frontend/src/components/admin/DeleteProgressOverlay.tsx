import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteProgressOverlayProps {
  isVisible: boolean;
  current?: number;
  total?: number;
  message?: string;
}

const DeleteProgressOverlay: React.FC<DeleteProgressOverlayProps> = ({
  isVisible,
  current = 0,
  total = 0,
  message,
}) => {
  if (!isVisible) return null;

  const progress = total > 0 ? Math.round((current / total) * 100) : 0;
  const displayMessage = message || (total > 1 
    ? `正在删除 ${current}/${total} 个商品...` 
    : '正在永久删除商品，请稍候...');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleIn">
        <div className="flex flex-col items-center space-y-6">
          {/* 删除图标动画 */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-red-600 animate-pulse" />
            </div>
            {/* 旋转的加载环 */}
            <div className="absolute inset-0 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          </div>

          {/* 加载动画 */}
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
            <p className="text-lg font-medium text-text-primary">{displayMessage}</p>
          </div>

          {/* 进度条（批量删除时显示） */}
          {total > 1 && (
            <div className="w-full space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-text-secondary">
                {progress}% 完成
              </p>
            </div>
          )}

          {/* 提示文字 */}
          <p className="text-sm text-center text-text-tertiary">
            此操作可能需要一些时间，请勿关闭页面
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteProgressOverlay;

