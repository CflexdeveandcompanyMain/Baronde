import { Router } from 'express';
import { initiateCheckout, getOrders, getOrderById, updateOrderStatus } from '../controllers/ordercontroller';
import { authToken } from '../middleware/authtoken';
import { Admin } from '../middleware/rbac';

const router = Router();

router.post('/checkout', authToken, initiateCheckout);
router.get('/', authToken, getOrders);
router.get('/:id', authToken, getOrderById);
router.put('/:id/status', authToken, Admin, updateOrderStatus);

export default router;