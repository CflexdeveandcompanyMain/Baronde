import { Router } from 'express';
import { getUsersWithOrders, getTotalRevenue, getTotalOrders } from '../controllers/orderanalyticcontroller';
import { authtoken } from '../middleware/authtoken';
import { admin } from '../middleware/rbac';

const router = Router();

router.get('/v1/users-orders', authtoken, admin, getUsersWithOrders);
router.get('/v1/total-revenue', authtoken, admin, getTotalRevenue);
router.get('/v1/total-orders', authtoken, admin , getTotalOrders);

export default router;
