const Workout = require('../models/workout.model');
const Exercise = require('../models/exercise.model');

// for Creating new Workout
exports.postWorkout = async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
};

// for Listing / Fetching Workouts
exports.getWorkout = async (req, res, next) => {};

// for Creating new Exercise
exports.postExercise = async (req, res, next) => {
  try {
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

    const workout = await Workout.findOne({
      ageGroup: ageGroup,
      purpose: purpose,
    });

    if (!workout) {
      return res.status(400).json({
        message: 'Age Group and Purpose of Workout and Exercise Not Match',
      });
    }

    if (!workout.ageGroup === ageGroup && workout.purpose === purpose) {
      return res.status(400).json({
        message: 'Age Group and Purpose of Workout and Exercise Not Match',
      });
    }

    const exercise = new Exercise({
      title: title,
      category: category,
      ageGroup: ageGroup,
      purpose: purpose,
      performedCount: 0,
      duration: '0',
      createdBy: req.session.user,
      equipMentRequired: equipMentRequired,
    });

    const result = await exercise.save();
    if (!result) {
      return res
        .status(500)
        .json({ message: 'There is a Problem adding a Exercise' });
    }
    res.status(201).json({
      message: 'Exercise Added',
      item: result,
    });

    workout.exercise.push(result._id);
    await workout.save();
  } catch (error) {
    console.log(error);
  }
};

// for Listing / Fetching Exercises
exports.getExercise = async (req, res, next) => {};
