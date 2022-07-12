import express from 'express'
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js'
import {
  addProduct, 
  getAllCarts, 
  getCarts,
  updateCart,
  deleteCart
} from '../controllers/cartController.js'

router.route('/').get(protect, getCarts);
router.route('/all').get(protect, getAllCarts);
router.route('/add').post(protect, addProduct);
router.route('/update/:productID').post(protect, updateCart);
router.route('/delete/:productID').delete(protect, deleteCart);

export default router;