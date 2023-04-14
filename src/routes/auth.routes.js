const express = require('express');

// Importing Auth Controller
const authController = require('../controllers/auth.controller');

// Importing Is Auth Middleware
const AuthMiddleware = require('../middleware/is-auth');

// Importing Roles
const Role = require('../helpers/role');

// Creating Express Router
const router = express.Router();

// Login route
router.post('/login', authController.postLogin);

// Register route
router.post('/signup', authController.postSignup);

// Logout route
router.put('/logout', authController.logOut);

// router.get('/welcome', AuthMiddleware.isAuth, welcomeuser.welcomeUser);

// router.get(
//   '/welcomeadmin',
//   AuthMiddleware.isAuth,
//   AuthMiddleware.checkRole([Role.Admin]),
//   welcomeuser.welcomeAdmin
// );

module.exports = router;
