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
router.post('/add-workout', adminController.postWorkout);

// For Getting a Workout
router.get('/get-workout', adminController.getWorkout);

// For Adding a Exercise
router.post('/add-exercise', adminController.postExercise);

// For Getting a Exercise
router.get('/get-exercise', adminController.getExercise);

module.exports = router;
