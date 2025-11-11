import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';
import { UploadController } from '../controllers/uploadController';

const router = Router();

// 所有上傳路由都需要認證和限制
router.use(authenticateToken);
router.use(uploadLimiter);

// 上傳圖片
router.post('/image', UploadController.uploadImage);

// 上傳多張圖片
router.post('/images', UploadController.uploadImages);

export default router;


