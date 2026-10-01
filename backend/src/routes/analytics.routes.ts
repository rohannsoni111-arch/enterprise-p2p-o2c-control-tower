import { Router } from 'express';
import {
  getExecutiveDashboard,
  getP2PDashboard,
  getO2CDashboard,
  getProcessTrace,
  getAuditLogs,
} from '../controllers/analytics.controller';

const router = Router();

router.get('/dashboard/executive', getExecutiveDashboard);
router.get('/dashboard/p2p', getP2PDashboard);
router.get('/dashboard/o2c', getO2CDashboard);
router.get('/trace', getProcessTrace);
router.get('/audit-logs', getAuditLogs);

export default router;
