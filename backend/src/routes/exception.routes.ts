import { Router } from 'express';
import {
  getExceptions,
  getExceptionById,
  updateException,
  getBusinessRules,
} from '../controllers/exception.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/exceptions', getExceptions);
router.get('/exceptions/:id', getExceptionById);
router.put('/exceptions/:id', authenticateToken, updateException);

router.get('/business-rules', getBusinessRules);

export default router;
