import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    createWorkspace,
    getMyWorkspaces,
    joinWorkspace,
} from '../controllers/workspaceController.js';

router.post('/', protect, createWorkspace);
router.get('/', protect, getMyWorkspaces);
router.post('/join', protect, joinWorkspace);

export default router;
