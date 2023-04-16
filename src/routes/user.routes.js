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
router.post(
  '/perform-exercise/:exerciseId',
  AuthMiddleware.isAuth,
  userController.performExercise
);

// For Getting a Workout
router.get('/get-workout', AuthMiddleware.isAuth, userController.getWorkout);

// For Getting a Exercise
router.get('/get-exercise', AuthMiddleware.isAuth, userController.getExercise);

// For Getting a Exercise and Workout Count And Total Duration
router.get(
  '/get-total-performed',
  AuthMiddleware.isAuth,
  userController.getTotalPerformed
);

module.exports = router;
