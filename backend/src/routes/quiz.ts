import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { QuizController } from '../controllers/quizController';

const router = Router();

// Public — record a quiz result
router.post('/results', QuizController.trackResult);

// Admin — fetch all analytics
router.get('/admin/analytics', authenticateToken, requireAdmin, QuizController.getAnalytics);

// Admin — clear all quiz results
router.delete('/admin/results', authenticateToken, requireAdmin, QuizController.clearResults);

export default router;
