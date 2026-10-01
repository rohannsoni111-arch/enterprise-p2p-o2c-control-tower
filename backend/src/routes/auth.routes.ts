import { Router } from 'express';
import { login, getMe, getPersonas } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.get('/personas', getPersonas);

export default router;
