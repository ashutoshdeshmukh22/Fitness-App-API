const Workout = require('../models/workout.model');
const Exercise = require('../models/exercise.model');

// for Creating new Workout
exports.postWorkout = async (req, res, next) => {
  const {
    title,
    category,
    ageGroup,
    purpose,
    exercisesCount,
    totalDuration,
    performedCount,
    createdBy,
  } = req.body;

  const exercisesCnt = await Exercise.find().countDocuments();

  const workout = new Workout({
    title: title,
    category: category,
    ageGroup: ageGroup,
    purpose: purpose,
    exercisesCount: exercisesCnt,
    totalDuration: totalDuration,
    performedCount: performedCount,
    createdBy: req.session.user,
  });

  const result = await workout.save();
  if (!result) {
    res.status(500).json({ message: 'There is a Problem adding a Workout' });
  }
  res.status(201).json({
    message: 'Workout Added',
    item: result,
  });
};

// for Listing / Fetching Workouts
exports.getWorkout = async (req, res, next) => {};

// for Creating new Exercise
exports.postExercise = async (req, res, next) => {
  const {
    title,
    category,
    ageGroup,
    purpose,
    performedCount,
    duration,
    createdBy,
    equipMentRequired,
  } = req.body;

  const exercise = new Exercise({
    title: title,
    category: category,
    ageGroup: ageGroup,
    purpose: purpose,
    performedCount: performedCount,
    duration: duration,
    createdBy: req.session.user,
    equipMentRequired: equipMentRequired,
  });

  const result = await exercise.save();
  if (!result) {
    res.status(500).json({ message: 'There is a Problem adding a Exercise' });
  }
  res.status(201).json({
    message: 'Exercise Added',
    item: result,
  });

  const exerciseId = result._id;
  const exerciseItem = await Exercise.findOne({
    _id: exerciseId,
  });

  const workout = await Workout.findOne({ category: exerciseItem.category });

  workout.exercise.push(exerciseItem._id);
  await workout.save();
};

// for Listing / Fetching Exercises
exports.getExercise = async (req, res, next) => {};
