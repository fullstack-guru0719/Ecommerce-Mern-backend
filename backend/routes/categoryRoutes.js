import express from 'express'
const router = express.Router()
import {
  getCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} from '../controllers/categoryController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory)
router
  .route('/:id')
  .delete(protect, admin, deleteCategory)
  .put(protect, admin, updateCategory)

export default router
