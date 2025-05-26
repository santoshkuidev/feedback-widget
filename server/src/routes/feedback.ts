import express from 'express';
import * as feedbackController from '../controllers/feedback';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/', feedbackController.submitFeedback);

// Protected routes (admin only)
router.get('/', authMiddleware, feedbackController.getAllFeedback);
router.get('/stats', authMiddleware, feedbackController.getFeedbackStats);
router.get('/export', authMiddleware, feedbackController.exportFeedbackCsv);
router.get('/:id', authMiddleware, feedbackController.getFeedbackById);
router.delete('/:id', authMiddleware, feedbackController.deleteFeedback);

export default router;
