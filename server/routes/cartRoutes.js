import express from 'express';
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:medicineId', updateCartItem);
router.delete('/items/:medicineId', removeCartItem);
router.delete('/', clearCart);

export default router;
