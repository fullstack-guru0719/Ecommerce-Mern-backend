import express from 'express'
import passport from 'passport'
const router = express.Router()
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  GoogleAuth,
  forgotPassword,
  resetPassword
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, admin, getUsers)
router.post('/login', authUser)
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)

router.post('/forgot', forgotPassword)
router.post('/reset/:token', resetPassword)

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profiel', 'email'],
    accessType: 'offline',
    approvalPrompt: 'force'
  })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  GoogleAuth
);

router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)

export default router
