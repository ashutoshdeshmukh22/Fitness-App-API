const Workout = require('../models/workout.model');
const Exercise = require('../models/exercise.model');
const User = require('../models/user.model');

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
      totalDuration: '0',
      performedCount: 0,
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
      workoutId: workout._id,
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
    // Adding the Exercise Reference To Its Workout
    let exerciseObj = { exerciseId: result._id, duration: result.duration };
    workout.exercise.push(exerciseObj);
    await workout.save();
    // Counting and Adding Exercises Count to DB
    const exercisesCnt = workout.exercise.length;
    workout.exercisesCount = exercisesCnt;
    await workout.save();
  } catch (error) {
    console.log(error);
  }
};

// for Listing / Fetching Workouts
exports.getWorkout = async (req, res, next) => {
  // console.log(req.query);
  const mode = req.query.mode;
  const sortby = req.query.sortby;

  try {
    // If Want Get All The Workouts Added by Specific Admin
    // const user = await User.findOne({
    //   email: req.session.user.email,
    // });
    // If Want to Fetch Admin Specific
    //{  createdBy: user._id,}
    const userAddedWorkouts = await Workout.find().sort({ [sortby]: mode });

    if (!userAddedWorkouts) {
      return res.status(404).json({
        message: 'There is Some Problem While Fetching Workouts',
      });
    }

    res.status(200).json({
      message: 'Success',
      Exercises: userAddedWorkouts,
    });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ message: 'There is Some Problem While Fetching Exercises' });
  }
};

// for Listing / Fetching Exercises
exports.getExercise = async (req, res, next) => {
  // console.log(req.query);
  const mode = req.query.mode;
  const sortby = req.query.sortby;

  try {
    // If Want Get All The Exercises Added by Specific Admin
    // const user = await User.findOne({
    //   email: req.session.user.email,
    // });
    // If Want to Fetch Admin Specific
    //{  createdBy: user._id,}
    const userAddedExercises = await Exercise.find().sort({ [sortby]: mode });

    if (!userAddedExercises) {
      return res.status(404).json({
        message: 'There is Some Problem While Fetching Exercises',
      });
    }

    res.status(200).json({
      message: 'Success',
      Exercises: userAddedExercises,
    });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ message: 'There is Some Problem While Fetching Exercises' });
  }
};
