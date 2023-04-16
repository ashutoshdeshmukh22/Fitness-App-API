const express = require('express');

// Importing Admin Controller
const adminController = require('../controllers/admin.controller');

// Importing Is Auth Middleware
const AuthMiddleware = require('../middleware/is-auth');

// Importing Roles
const Role = require('../helpers/role');

// Creating Express Router
const router = express.Router();

// For Adding a Workout
router.post(
  '/add-workout',
  AuthMiddleware.isAuth,
  AuthMiddleware.checkRole([Role.Admin]),
  adminController.postWorkout
);

// For Adding a Exercise
router.post(
  '/add-exercise',
  AuthMiddleware.isAuth,
  AuthMiddleware.checkRole([Role.Admin]),
  adminController.postExercise
);

// For Getting a Workout
router.get(
  '/get-workout',
  AuthMiddleware.isAuth,
  AuthMiddleware.checkRole([Role.Admin]),
  adminController.getWorkout
);

// For Getting a Exercise
router.get(
  '/get-exercise',
  AuthMiddleware.isAuth,
  AuthMiddleware.checkRole([Role.Admin]),
  adminController.getExercise
);

module.exports = router;
