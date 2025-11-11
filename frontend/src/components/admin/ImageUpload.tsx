import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { uploadApi } from '@/services/upload';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 10,
  label = '商品图片',
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'));

    if (images.length + imageFiles.length > maxImages) {
      toast.error(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('请选择图片文件');
      return;
    }

    setUploading(true);
    try {
      // 上传到服务器
      const uploadedUrls = await uploadApi.uploadImages(imageFiles);
      onChange([...images, ...uploadedUrls]);
      toast.success(`成功上传 ${uploadedUrls.length} 张图片`);
    } catch (error: any) {
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
      
      {/* 图片预览网格 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={14} />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-brand-blue text-white text-xs px-2 py-1 rounded">
                  主图
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {images.length < maxImages && (
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
            multiple
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
                    支持 JPG、PNG、WebP 格式，最多 {maxImages} 张，单张最大 10MB
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
          或输入图片 URL（用逗号分隔多个 URL）
        </label>
        <textarea
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          rows={3}
          onChange={(e) => {
            const urls = e.target.value
              .split(',')
              .map((url) => url.trim())
              .filter((url) => url && (url.startsWith('http://') || url.startsWith('https://')));
            if (urls.length > 0) {
              onChange([...images, ...urls.slice(0, maxImages - images.length)]);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ImageUpload;

