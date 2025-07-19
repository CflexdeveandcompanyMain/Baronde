import { Router } from 'express';
import { addItemToCart, getCart, updateCartItemQuantity, removeCartItem, clearCart } from '../controllers/cartcontroller';
import { authToken } from '../middleware/authtoken';

const router = Router();

router.post('/', authToken, addItemToCart);
router.get('/', authToken, getCart);
router.put('/item/:productId', authToken, updateCartItemQuantity);
router.delete('/item/:productId', authToken, removeCartItem);
router.delete('/', authToken, clearCart);

export default router;