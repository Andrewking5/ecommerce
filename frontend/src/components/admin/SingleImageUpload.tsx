import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { uploadApi } from '@/services/upload';
import toast from 'react-hot-toast';

interface SingleImageUploadProps {
  image?: string;
  onChange: (image: string | undefined) => void;
  label?: string;
}

const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  image,
  onChange,
  label = '图片',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = await uploadApi.uploadImages([file]);
      if (uploadedUrls.length > 0) {
        onChange(uploadedUrls[0]);
        toast.success('图片上传成功');
      }
    } catch (error: any) {
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange(undefined);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
      
      {/* 图片预览 */}
      {image && (
        <div className="relative mb-4">
          <div className="w-full max-w-xs aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* 上传区域 */}
      {!image && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-brand-blue bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                <p className="text-sm text-text-secondary">上传中...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-text-primary font-medium">
                    拖拽图片到此处或
                    <button
                      type="button"
                      onClick={openFileDialog}
                      className="text-brand-blue hover:text-brand-blue/80 ml-1"
                    >
                      点击上传
                    </button>
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    支持 JPG、PNG、WebP 格式，单张最大 10MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openFileDialog}
                  className="flex items-center space-x-2"
                >
                  <ImageIcon size={16} />
                  <span>选择图片</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* URL 输入方式 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          或输入图片 URL
        </label>
        <input
          type="text"
          placeholder="https://example.com/image.jpg 或 /uploads/products/image.jpg"
          value={image || ''}
          onChange={(e) => {
            const url = e.target.value.trim();
            onChange(url || undefined);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <p className="mt-1 text-xs text-text-tertiary">
          支持完整 URL 或相对路径
        </p>
      </div>
    </div>
  );
};

export default SingleImageUpload;

