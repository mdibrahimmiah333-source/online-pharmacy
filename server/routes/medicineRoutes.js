import express from 'express';
import {
  createMedicine,
  deleteMedicine,
  getMedicineById,
  getMedicines,
  updateMedicine,
} from '../controllers/medicineController.js';
import { adminOnly, protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/').get(getMedicines).post(protect, adminOnly, createMedicine);
router
  .route('/:id')
  .get(getMedicineById)
  .put(protect, adminOnly, updateMedicine)
  .delete(protect, adminOnly, deleteMedicine);

export default router;
