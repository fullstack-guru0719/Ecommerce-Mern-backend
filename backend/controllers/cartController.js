import asyncHandler from 'express-async-handler'
import Cart from '../models/cartModel.js'
import Product from '../models/productModel.js'

// @desc    Add cart in case of loggedin user
// @route   POST /api/carts/add
// @access  Private
const addProduct = asyncHandler(async (req, res) => {
  if(!req.user) {
    res.status(404).json({
      message: 'No registered user'
    })
    return
  }
  const user = req.user._id
  const { product, quantity } = req.body.products
  const selectedProduct = await Product.findOne({_id: product})
  const totalPrice = selectedProduct.price * quantity;
  if(quantity > selectedProduct.countInStock) {
    res.status(404).json({
      message: 'There isn\'t enough inventory',
      quantity: selectedProduct.countInStock
    });
    return
  }
  const curCart = await Cart.findOne({user: user})
  let addedCart;
  if(curCart) {
    curCart.products.push({product, quantity, totalPrice});
    addedCart = await curCart.save();
  } else {
    const cart = new Cart({
      user,
      products: {
        product, quantity, totalPrice
      }
    })
  
    addedCart = await cart.save();
  }
  res.status(201).json(addedCart)
})

// @desc    Get the not-checked cart of the loggedin user
// @route   GET /api/carts/
// @access  Private
const getCarts = asyncHandler(async (req, res) => {
  if(!req.user) {
    res.status(404).json({
      message: 'No registered user'
    })
    return
  }
  const user = req.user._id
  const cart = await Cart.find({user: user, checkOut: false}).populate({
    path: 'products',
    populate: {
      path: 'product',
    }
  })
  res.json(cart)
})

// @desc    Get all the history of carts of the loggedin user
// @route   GET /api/carts/all
// @access  Private
const getAllCarts = asyncHandler(async (req, res) => {
  if(!req.user) {
    res.status(404).json({
      message: 'No registered user'
    })
    return
  }
  const user = req.user._id
  const carts = await Cart.find({user: user}).populate({
    path: 'products',
    populate: {
      path: 'product',
    }
  })
  res.json(carts)
})

// @desc    Update the cart with Product quantity
// @route   POST /api/carts/update/:productID
// @access  Private
const updateCart = asyncHandler(async (req, res) => {
  if(!req.user) {
    res.status(404).json({
      message: 'No registered user'
    })
    return
  }
  const quantity = req.body.quantity
  const productID = req.params.productID
  const query = { user: req.user._id }
  const selectedProduct = await Product.findOne({_id: productID})
  if(quantity > selectedProduct.countInStock) {
    res.status(404).json({
      message: 'There isn\'t enough inventory',
      quantity: selectedProduct.countInStock
    });
    return
  }
  try {
    const curCart = await Cart.findOne(query);
    let id = curCart.products.map(item => item.product).indexOf(productID)
    if(!quantity) {
      curCart.products.splice(id, 1)
    } else {
      curCart.products[id].quantity = quantity
      curCart.products[id].totalPrice = quantity * selectedProduct.price
    }
    const filteredCart = await curCart.save()
    res.status(201).json(filteredCart.populate({
      path: 'products',
      populate: {
        path: 'product',
    }
    }))
  } catch(err) {
    res.status(404)
    throw new Error(err)
  }
})

// @desc    Delete product on the cart
// @route   DELETE /api/carts/update/:productID
// @access  Private
const deleteCart = asyncHandler(async (req, res) => {
  if(!req.user) {
    res.status(404).json({
      message: 'No registered user'
    })
    return
  }
  const productID = req.params.productId
  const query = { user: req.user._id }
  try {
    const curCart = await Cart.findOne(query);
    var id = curCart.products.map(item => item.product).indexOf(productID)
    curCart.products.splice(id, 1);
    const filteredCart = await curCart.save();
    res.status(201).json(filteredCart);
  } catch(err) {
    res.status(404)
    throw new Error(err)
  }
})

export {
  addProduct,
  updateCart,
  deleteCart,
  getCarts,
  getAllCarts
}