import express from 'express';
import {
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { adminOnly, protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.get('/my', getMyOrders);
router.get('/', adminOnly, getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;
