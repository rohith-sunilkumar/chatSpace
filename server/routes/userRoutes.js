import express from 'express';
const router = express.Router();
import { getMe, getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/', protect, getUsers);

router.get('/me', protect, getMe);

export default router;
