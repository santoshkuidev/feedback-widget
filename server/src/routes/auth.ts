import express from 'express';
import * as authController from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/api-key/:id', authMiddleware, authController.generateApiKey);

export default router;
