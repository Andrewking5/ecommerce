import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AddressController } from '../controllers/addressController';
import { validateRequest } from '../middleware/validation';
import { addressSchema } from '../utils/validation';

const router = Router();

// 所有地址路由都需要认证
router.use(authenticateToken);

// 获取用户所有地址
router.get('/', AddressController.getUserAddresses);

// 获取默认地址
router.get('/default', AddressController.getDefaultAddress);

// 获取单个地址
router.get('/:id', AddressController.getAddressById);

// 创建新地址
router.post('/', validateRequest(addressSchema), AddressController.createAddress);

// 更新地址
router.put('/:id', validateRequest(addressSchema), AddressController.updateAddress);

// 删除地址
router.delete('/:id', AddressController.deleteAddress);

// 设置默认地址
router.put('/:id/set-default', AddressController.setDefaultAddress);

export default router;

