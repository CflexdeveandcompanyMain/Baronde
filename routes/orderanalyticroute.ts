import { Router } from 'express';
import { getUsersWithOrders, getTotalRevenue, getTotalOrders } from '../controllers/orderanalyticcontroller';
import { authToken } from '../middleware/authtoken.ts'
import {Admin} from '../middleware/rbac.ts'

const router = Router();

router.get('/v1/users-orders', authToken, Admin, getUsersWithOrders);
router.get('/v1/total-revenue', authToken, Admin, getTotalRevenue);
router.get('/v1/total-orders', authToken, Admin, getTotalOrders);

export default router;
