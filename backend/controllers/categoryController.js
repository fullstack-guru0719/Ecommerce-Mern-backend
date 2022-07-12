import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';
import { updateCart } from './cartController.js';

// @desc    Fetch all the categories
// @route   GET /api/categories/
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json({categories});
})

// @desc    Add Category by Admin
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = new Category({...req.body})
  try {
    const createCategory = await category.save()
    res.status(201).json(createCategory)
  } catch(err) {
    res.status(404)
    throw new Error(err)
  }
})

// @desc    Update Category by Admin
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const {
    name,
    description
  } = req.body

  const category = await Category.findById(id)

  if(category) {
    category.name = name
    category.description = description

    const updateCategory = await category.save()
    res.status(201).json(updateCategory)
  } else {
    res.status(404)
    throw new Error('Category not found')
  }
})

// @desc    Update Category by Admin
// @route   delete /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params

  const category = await Category.findById(id)

  if(category) {
    await category.remove()
    res.status(201).json({ message: 'Product removed' })
  } else {
    res.status(404)
    throw new Error('Category not found')
  }
})


export {
  getCategories,
  deleteCategory,
  createCategory,
  updateCategory
}