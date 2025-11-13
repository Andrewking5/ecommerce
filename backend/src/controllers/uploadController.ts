import { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 檢查 Cloudinary 配置
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// 判斷使用哪種存儲方式
const useLocalStorage = () => {
  // 開發環境或 Cloudinary 未配置時使用本地存儲
  return process.env.NODE_ENV === 'development' || !isCloudinaryConfigured();
};

// 設定 Cloudinary（僅在配置存在且非開發環境時）
if (isCloudinaryConfigured() && process.env.NODE_ENV === 'production') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured (production mode)');
} else if (useLocalStorage()) {
  console.log('📁 Using local file storage (development mode)');
  
  // 確保上傳目錄存在
  const uploadDir = path.join(process.cwd(), 'uploads');
  const productsDir = path.join(uploadDir, 'products');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created uploads directory');
  }
  
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
    console.log('📁 Created uploads/products directory');
  }
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

// 本地文件上傳函數
const uploadToLocal = async (buffer: Buffer, originalName: string, req?: Request): Promise<{ url: string; publicId: string }> => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'products');
  const fileExt = path.extname(originalName) || '.jpg';
  const fileName = `${uuidv4()}${fileExt}`;
  const filePath = path.join(uploadDir, fileName);
  
  // 確保目錄存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // 保存文件
  fs.writeFileSync(filePath, buffer);
  
  // 構建完整的 URL
  // 如果是開發環境，使用請求的協議和主機
  // 如果是生產環境，使用 API_URL 環境變數
  let baseUrl = '';
  if (req) {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3001';
    baseUrl = `${protocol}://${host}`;
  } else {
    // 從環境變數獲取 API URL（去掉 /api 後綴）
    const apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    baseUrl = apiUrl.replace('/api', '');
  }
  
  const url = `${baseUrl}/uploads/products/${fileName}`;
  const publicId = `products/${fileName}`;
  
  return { url, publicId };
};

// Cloudinary 上傳函數
const uploadToCloudinary = async (buffer: Buffer): Promise<{ url: string; publicId: string }> => {
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
          console.error('Cloudinary upload error:', {
            message: error.message,
            http_code: (error as any).http_code,
            name: error.name,
          });
          reject(error);
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        }
      }
    ).end(buffer);
  });
};

export class UploadController {
  // 上傳單張圖片
  static uploadImage = [
    upload.single('image'),
    async (req: Request, res: Response): Promise<void> => {
      try {
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

        // 根據環境選擇存儲方式
        let result: { url: string; publicId: string };
        
        if (useLocalStorage()) {
          // 本地存儲
          result = await uploadToLocal(compressedBuffer, req.file.originalname, req);
          console.log('📁 Image saved to local storage:', result.url);
        } else {
          // Cloudinary 存儲
          if (!isCloudinaryConfigured()) {
            res.status(500).json({
              success: false,
              message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
            });
            return;
          }
          result = await uploadToCloudinary(compressedBuffer);
          console.log('☁️ Image uploaded to Cloudinary:', result.url);
        }

        res.json({
          success: true,
          message: 'Image uploaded successfully',
          data: result,
        });
        return;
      } catch (error: any) {
        console.error('Upload image error:', {
          message: error?.message,
          http_code: error?.http_code,
          name: error?.name,
          stack: error?.stack,
        });
        
        // Cloudinary 错误特殊处理
        if (error?.http_code === 401 || error?.message?.includes('Invalid api_key')) {
          res.status(500).json({
            success: false,
            message: 'Cloudinary configuration error. Please check CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_CLOUD_NAME environment variables.',
          });
          return;
        }
        
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
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
          res.status(400).json({
            success: false,
            message: 'No image files provided',
          });
          return;
        }

        const files = req.files as Express.Multer.File[];
        console.log(`📤 Processing ${files.length} file(s) for upload...`);
        
        const uploadPromises = files.map(async (file, index) => {
          try {
            console.log(`📤 Processing file ${index + 1}/${files.length}: ${file.originalname} (${file.size} bytes)`);
            
            // 壓縮圖片
            const compressedBuffer = await sharp(file.buffer)
              .jpeg({ quality: 80 })
              .png({ quality: 80 })
              .webp({ quality: 80 })
              .toBuffer();

            console.log(`✅ File ${index + 1} compressed: ${compressedBuffer.length} bytes`);

            // 根據環境選擇存儲方式
            if (useLocalStorage()) {
              const result = await uploadToLocal(compressedBuffer, file.originalname, req);
              console.log(`✅ File ${index + 1} saved to local storage: ${result.url}`);
              return result;
            } else {
              if (!isCloudinaryConfigured()) {
                throw new Error('Cloudinary is not configured');
              }
              const result = await uploadToCloudinary(compressedBuffer);
              console.log(`✅ File ${index + 1} uploaded to Cloudinary: ${result.url}`);
              return result;
            }
          } catch (fileError: any) {
            console.error(`❌ Error processing file ${index + 1} (${file.originalname}):`, {
              message: fileError?.message,
              stack: fileError?.stack,
            });
            throw fileError;
          }
        });

        const results = await Promise.all(uploadPromises);

        console.log(`✅ ${results.length} image(s) uploaded using ${useLocalStorage() ? 'local storage' : 'Cloudinary'}`);

        res.json({
          success: true,
          message: 'Images uploaded successfully',
          data: results,
        });
        return;
      } catch (error: any) {
        console.error('❌ Upload images error:', {
          message: error?.message,
          http_code: error?.http_code,
          name: error?.name,
          code: error?.code,
          errno: error?.errno,
          stack: error?.stack,
        });
        
        // Cloudinary 错误特殊处理
        if (error?.http_code === 401 || error?.message?.includes('Invalid api_key')) {
          res.status(500).json({
            success: false,
            message: 'Cloudinary configuration error. Please check CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_CLOUD_NAME environment variables.',
          });
          return;
        }
        
        // 文件系统错误处理
        if (error?.code === 'ENOENT' || error?.code === 'EACCES' || error?.errno) {
          res.status(500).json({
            success: false,
            message: `File system error: ${error.message}. Please check uploads directory permissions.`,
          });
          return;
        }
        
        res.status(500).json({
          success: false,
          message: error?.message || 'Failed to upload images',
          ...(process.env.NODE_ENV === 'development' && { 
            error: error?.message,
            stack: error?.stack 
          }),
        });
        return;
      }
    },
  ];
}


