const express = require('express');

// Importing User Controller
const userController = require('../controllers/user.controller');

// Importing Is Auth Middleware
const AuthMiddleware = require('../middleware/is-auth');

// Importing Roles
const Role = require('../helpers/role');

// Creating Express Router
const router = express.Router();

// For Performing a Exercise
router.post('/perform-exercise/:exerciseId', userController.performExercise);

module.exports = router;
