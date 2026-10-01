import { Router } from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  getVendors,
  getVendorById,
  getCustomers,
  getCustomerById,
  getPlants,
  getOrgStructure,
} from '../controllers/masterData.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Material Master (MM01/MM03)
router.get('/materials', getMaterials);
router.get('/materials/:id', getMaterialById);
router.post('/materials', authenticateToken, authorizeRoles('ADMIN', 'PROCUREMENT', 'WAREHOUSE'), createMaterial);

// Vendor Master (XK01/XK03)
router.get('/vendors', getVendors);
router.get('/vendors/:id', getVendorById);

// Customer Master (XD01/XD03)
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);

// Enterprise Structure (Plants, Storage Locations, Orgs)
router.get('/plants', getPlants);
router.get('/orgs', getOrgStructure);

export default router;
