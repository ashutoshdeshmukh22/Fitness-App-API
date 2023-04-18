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

    // Validating Age Group, Purpose and Category
    if (!['18-45', '45-60', '60+'].includes(ageGroup)) {
      return res
        .status(500)
        .json({ message: 'Age Group Must Be 18-45, 45-60, 60+' });
    } else if (!['Weight Loss', 'Weight Gain', 'Stay Fit'].includes(purpose)) {
      return res.status(500).json({
        message: 'Purpose Must Be Weight Loss, Weight Gain, Stay Fit',
      });
    } else if (!['Full Body', 'Upper Body', 'Lower Body'].includes(category)) {
      return res.status(500).json({
        message: 'Category Must Be Full Body, Upper Body, Lower Body',
      });
    }
    // Saving Workout To Database
    try {
      const workout = new Workout({
        title: title,
        category: category,
        ageGroup: ageGroup,
        purpose: purpose,
        exercisesCount: 0,
        totalDuration: '0',
        performedCount: 0,
        createdBy: req.session.user,
      });

      // Before Creating Workout, Checking if Workout with same age group, category and purpose is Already Exist In th DB or Not
      const allWorkouts = await Workout.findOne({
        ageGroup: ageGroup,
        purpose: purpose,
        category: category,
      });

      if (allWorkouts) {
        return res.status(400).json({
          message:
            'Workout Already Exists With Same Age Group, Purpose and Category',
        });
      }

      const workoutResult = await workout.save();
      res.status(201).json({
        message: 'Workout Added',
        item: workoutResult,
      });

      // Saving Exercises To Workout Those have same age group and purpose
      try {
        const WorkoutAgeGroup = workoutResult.ageGroup;
        const WorkoutPurpose = workoutResult.purpose;
        // Finding Exercises which has same age group and purpose
        const exercises = await Exercise.find({
          ageGroup: WorkoutAgeGroup,
          purpose: WorkoutPurpose,
        });

        if (exercises.length === 0) {
          return console.log(
            'Exercises Not Found With Same AgeGroup and Purpose as Workout'
          );
        }
        // But if There Are Exercises With Same AgeGroup and Purpose as Workout Then Add Those to Workout
        workoutResult.exercise.push(...exercises);
        await workoutResult.save();
        // -------------------------------------------------------------------------------------
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'There is a Problem adding a Workout' });
    }
  } catch (error) {
    console.log(error);
    next(error);
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

    if (!['18-45', '45-60', '60+'].includes(ageGroup)) {
      return res
        .status(500)
        .json({ message: 'Age Group Must Be 18-45, 45-60, 60+' });
    } else if (!['Weight Loss', 'Weight Gain', 'Stay Fit'].includes(purpose)) {
      return res.status(500).json({
        message: 'Purpose Must Be Weight Loss, Weight Gain, Stay Fit',
      });
    } else if (!['Full Body', 'Upper Body', 'Lower Body'].includes(category)) {
      return res.status(500).json({
        message: 'Category Must Be Full Body, Upper Body, Lower Body',
      });
    }

    try {
      const exercise = new Exercise({
        title: title,
        category: category,
        ageGroup: ageGroup,
        purpose: purpose,
        performedCount: 0,
        duration: 0,
        createdBy: req.session.user,
        // workoutId: workout._id,
        equipMentRequired: equipMentRequired,
      });

      // Before Creating Exercise, Checking if Exercise with same age group, category and purpose is Already Exist In th DB or Not

      const allExercises = await Exercise.findOne({
        title: title,
        ageGroup: ageGroup,
        purpose: purpose,
        category: category,
      });

      if (allExercises) {
        return res.status(400).json({
          message:
            'Exercise Already Exists With Same Age Group, Purpose and Category',
        });
      }

      const result = await exercise.save();
      res.status(201).json({ message: 'Exercise Added', item: result });

      // Adding the Newly added Exercise Reference To Its Workout
      try {
        const workout = await Workout.findOne({
          category: result.category,
          ageGroup: result.ageGroup,
          purpose: result.purpose,
        });

        if (workout) {
          workout.exercise.push(result);
          await workout.save();
          // Updating exercisesCount in Workout
          const exercisesCnt = workout.exercise.length;
          workout.exercisesCount = exercisesCnt;
          await workout.save();
        } else {
          console.log(
            'Failed to Add the Newly added Exercise Reference To Its Workout'
          );
        }

        // Saving Workout Id To Current Exercise To Relate That the exercise belongs to which workout
        if (workout) {
          exercise.workoutId = workout._id;
          await exercise.save();
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'There is a Problem adding a Exercise' });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// for Listing / Fetching Workouts
exports.getWorkout = async (req, res, next) => {
  // console.log(req.query);
  const mode = req.query.mode;
  const sortby = req.query.sortby;
  const sortFields = sortby.split(',');

  try {
    // If Want Get All The Workouts Added by Specific Admin
    // const user = await User.findOne({
    //   email: req.session.user.email,
    // });
    // If Want to Fetch Admin Specific
    //{  createdBy: user._id,}
    let sort = {};
    sortFields.forEach((field) => {
      sort[field] = mode;
    });
    const userAddedWorkouts = await Workout.find().sort(sort);

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
  let isRequired;
  const equipMentRequired = req.query.equipMentRequired;
  if (equipMentRequired) {
    isRequired = JSON.parse(equipMentRequired);
  }
  const sortFields = sortby.split(',');

  try {
    // If Want Get All The Exercises Added by Specific Admin
    // const user = await User.findOne({
    //   email: req.session.user.email,
    // });
    // If Want to Fetch Admin Specific
    //{  createdBy: user._id,}
    // Create a dynamic sort object based on the sortFields array
    let sort = {};
    sortFields.forEach((field) => {
      sort[field] = mode;
    });

    // Checking If The equipMentRequired parameter is passed or not as it is OPTIONAL
    const userAddedExercisesQuery = {};
    if (equipMentRequired) {
      userAddedExercisesQuery.equipMentRequired = isRequired;
    }

    const userAddedExercises = await Exercise.find(
      userAddedExercisesQuery
    ).sort(sort);

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
