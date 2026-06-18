import { Router } from 'express';
import { MemorialController } from '../controllers/memorialController';

const router = Router();

// 公開 — 親友提交弔唁登記
router.post('/entries', MemorialController.submitEntry);

// 公開 — 讀取訃聞內容
router.get('/notice', MemorialController.getNotice);

// 管理（x-memorial-key 金鑰保護）
router.get('/entries', MemorialController.listEntries);        // 列表 / 匯出 CSV
router.delete('/entries/:id', MemorialController.deleteEntry); // 刪除單筆
router.delete('/entries', MemorialController.clearEntries);    // 一鍵清空全部
router.put('/notice', MemorialController.saveNotice);          // 編輯訃聞內容

export default router;
