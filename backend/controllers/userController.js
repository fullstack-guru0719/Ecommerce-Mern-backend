import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'
import crypto from 'crypto'
import sendEmailtoUser from '../utils/mailgun.js'
import bcrypt from 'bcryptjs';



// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()
    console.log(updateUser)
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await user.remove()
    res.json({ message: 'User removed' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.isAdmin = req.body.isAdmin

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Google Account Login
// @route   PUT /api/users/google/callback
// @access  Private/Google Account
const GoogleAuth = asyncHandler(async (req, res) => {
  const user = {
    email: req.user.email,
    name: req.user.name,
    _id: req.user._id,
    token: generateToken(req.user._id)
  }
  const htmlWithEmbeddedJWT = `
    <html>
      <script>
        // Save JWT to localStorage
        window.localStorage.setItem('userInfo', '${user}');
        // Redirect browser to root of application
        window.location.href = '/auth/success';
      </script>
    </html>
  `

  res.send(htmlWithEmbeddedJWT)
})

// @desc    Forgot Password
// @route   POST /api/users/forgot
// @access  public
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email

  if(!email) {
    res.status(404)
    throw new Error("You must enter an email address.")
  }

  try {
    const user = await User.findOne({email})
    if(!user) {
      res.status(404)
      throw new Error("Your request could not be processed as entered. Please try again.")
    }

    crypto.randomBytes(48, (err, buffer) => {
      const resetToken = buffer.toString('hex')
      if(err) {
        res.status(404)
        throw new Error('Your request could not be processed. Please try again')
      }

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Data.now() + 3600000

      user.save(async err => {
        if(err) {
          res.status(404)
          throw new Error('Your request could not be processed. Please try again')
        }

        await sendEmailtoUser(
          user.email, 
          'reset',
          req.header.host,
          resetToken
        )

        res.status(200).json({
          success: true,
          message:
            'Please check your email for the link to reset your password.'
        });
      })
    })


  } catch(err) {
    res.status(404)
    throw new Error(err)
  }
})

// @desc    Reset Password by Token
// @route   POST /api/users/reset/:token
// @access  public
const resetPassword = asyncHandler(async (req, res) => {
  const password = req.body.password;

  if (!password) {
    return res.status(400).json({ message: 'You must enter a password.' });
  }

  const resetUser = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  })

  if(!resetUser) {
    return res.status(400).json({
      message:
        'Your token has expired. Please attempt to reset your password again.'
    });
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (err) {
        return res.status(400).json({
          error:
            'Your request could not be processed as entered. Please try again.'
        });
      }
      req.body.password = hash;

      resetUser.password = req.body.password;
      resetUser.resetPasswordToken = undefined;
      resetUser.resetPasswordExpires = undefined;

      resetUser.save(async err => {
        if (err) {
          return res.status(400).json({
            error:
              'Your request could not be processed as entered. Please try again.'
          });
        }

        await sendEmailtoUser(resetUser.email, 'reset-confirmation');

        res.status(200).json({
          success: true,
          message:
            'Password changed successfully. Please login with your new password.'
        });
      });
    });
  });
})

export {
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
}
