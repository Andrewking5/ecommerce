import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/utils/imageUrl';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
  const { t } = useTranslation('common');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
        <span className="text-text-tertiary">{t('noImage', { defaultValue: 'No Image' })}</span>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* 主图片 */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={getImageUrl(images[selectedIndex])}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* 导航按钮 */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-text-primary" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-text-primary" />
            </button>
          </>
        )}

        {/* 放大按钮 */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
          aria-label="Zoom image"
        >
          <ZoomIn size={20} className="text-text-primary" />
        </button>

        {/* 图片指示器 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 缩略图 */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 transition-all ${
                index === selectedIndex
                  ? 'border-brand-blue ring-2 ring-brand-blue/20'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={getImageUrl(image)}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* 放大预览模态框 */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Close zoom"
            >
              <X size={24} className="text-white" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} className="text-white" />
                </button>
              </>
            )}

            <motion.img
              src={getImageUrl(images[selectedIndex])}
              alt={`${productName} - Zoomed`}
              className="max-w-full max-h-[90vh] object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* 图片计数器 */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductImageGallery;

