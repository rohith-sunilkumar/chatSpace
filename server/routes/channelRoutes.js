import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createChannel, getChannels } from '../controllers/channelController.js';

router.post('/', protect, createChannel);
router.get('/:workspaceId', protect, getChannels);

export default router;
