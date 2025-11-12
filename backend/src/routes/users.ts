import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { UserController } from '../controllers/userController';

const router = Router();

// 所有用戶路由都需要認證
router.use(authenticateToken);

// 用戶個人資料
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/password', UserController.changePassword);
router.put('/language', UserController.updateLanguage);

// 管理員路由
router.get('/', requireAdmin, UserController.getAllUsers);
router.get('/:id', requireAdmin, UserController.getUserById);
router.put('/:id', requireAdmin, UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);

export default router;


