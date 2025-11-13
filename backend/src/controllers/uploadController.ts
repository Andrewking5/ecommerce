import { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// 檢查 Cloudinary 配置
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// 設定 Cloudinary（僅在配置存在時）
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured');
} else {
  console.warn('⚠️  Cloudinary not configured. Image upload will fail.');
  console.warn('⚠️  Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
}

// 設定 Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export class UploadController {
  // 上傳單張圖片
  static uploadImage = [
    upload.single('image'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        // 檢查 Cloudinary 配置
        if (!isCloudinaryConfigured()) {
          res.status(500).json({
            success: false,
            message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
          });
          return;
        }

        if (!req.file) {
          res.status(400).json({
            success: false,
            message: 'No image file provided',
          });
          return;
        }

        // 壓縮圖片
        const compressedBuffer = await sharp(req.file.buffer)
          .jpeg({ quality: 80 })
          .png({ quality: 80 })
          .webp({ quality: 80 })
          .toBuffer();

        // 上傳到 Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'ecommerce/products',
              resource_type: 'auto',
              quality: 'auto',
              fetch_format: 'auto',
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(compressedBuffer);
        });

        res.json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            url: (result as any).secure_url,
            publicId: (result as any).public_id,
          },
        });
        return;
      } catch (error: any) {
        console.error('Upload image error:', {
          message: error?.message,
          stack: error?.stack,
        });
        res.status(500).json({
          success: false,
          message: error?.message || 'Failed to upload image',
        });
        return;
      }
    },
  ];

  // 上傳多張圖片
  static uploadImages = [
    upload.array('images', 10), // 最多 10 張圖片
    async (req: Request, res: Response): Promise<void> => {
      try {
        // 檢查 Cloudinary 配置
        if (!isCloudinaryConfigured()) {
          res.status(500).json({
            success: false,
            message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
          });
          return;
        }

        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
          res.status(400).json({
            success: false,
            message: 'No image files provided',
          });
          return;
        }

        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map(async (file) => {
          // 壓縮圖片
          const compressedBuffer = await sharp(file.buffer)
            .jpeg({ quality: 80 })
            .png({ quality: 80 })
            .webp({ quality: 80 })
            .toBuffer();

          // 上傳到 Cloudinary
          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: 'ecommerce/products',
                resource_type: 'auto',
                quality: 'auto',
                fetch_format: 'auto',
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            ).end(compressedBuffer);
          });
        });

        const results = await Promise.all(uploadPromises);

        res.json({
          success: true,
          message: 'Images uploaded successfully',
          data: results.map((result: any) => ({
            url: result.secure_url,
            publicId: result.public_id,
          })),
        });
        return;
      } catch (error: any) {
        console.error('Upload images error:', {
          message: error?.message,
          stack: error?.stack,
        });
        res.status(500).json({
          success: false,
          message: error?.message || 'Failed to upload images',
        });
        return;
      }
    },
  ];
}


