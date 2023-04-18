const express = require('express');
const { check, body } = require('express-validator/check');

// Importing Auth Controller
const authController = require('../controllers/auth.controller');

// Importing Roles
const Role = require('../helpers/role');

// Creating Express Router
const router = express.Router();

// Login route
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please Enter A Valid Email Address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .exists()
      .withMessage('All input is required')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

// Register route
router.post(
  '/signup',
  [
    body('username').exists().withMessage('All input is required'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password must have minimum 5 characters.')
      .exists()
      .withMessage('All input is required')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('role').exists().withMessage('All input is required'),
  ],
  authController.postSignup
);

// Logout route
router.put('/logout', authController.logOut);

module.exports = router;
