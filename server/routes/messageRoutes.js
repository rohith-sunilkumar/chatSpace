import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    sendMessage,
    getChannelMessages,
    updateMessage,
    deleteMessage,
    toggleReaction,
    getDMMessages,
    sendDM
} from '../controllers/messageController.js';

router.get('/dm/:userId', protect, getDMMessages);
router.post('/dm', protect, sendDM);

router.post('/', protect, sendMessage);
router.get('/:channelId', protect, getChannelMessages);
router.put('/:id', protect, updateMessage);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/react', protect, toggleReaction);

export default router;
