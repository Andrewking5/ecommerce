import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { QuizController } from '../controllers/quizController';

const router = Router();

// Simple secret-key guard for layout editor (no user login required)
function requireQuizKey(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.QUIZ_EDIT_KEY;
  if (!secret) { next(); return; } // no key configured → open (dev mode)
  const provided = req.headers['x-quiz-key'];
  if (provided !== secret) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  next();
}

// Public — record a quiz result
router.post('/results', QuizController.trackResult);

// Public — get layout config for a character
router.get('/layout/:slug', QuizController.getLayout);

// Layout editor — accepts either X-Quiz-Key OR admin JWT
router.put('/admin/layout/:slug', (req, res, next) => {
  const secret = process.env.QUIZ_EDIT_KEY;
  if (secret && req.headers['x-quiz-key'] === secret) { next(); return; }
  // Fall through to admin JWT check
  authenticateToken(req, res, () => requireAdmin(req, res, next));
}, QuizController.saveLayout);

// Admin — fetch all analytics
router.get('/admin/analytics', authenticateToken, requireAdmin, QuizController.getAnalytics);

// Admin — clear all quiz results
router.delete('/admin/results', authenticateToken, requireAdmin, QuizController.clearResults);

export default router;
