const Workout = require('../models/workout.model');
const Exercise = require('../models/exercise.model');
const User = require('../models/user.model');
const addTimeHelper = require('../helpers/addTime');

// To Start the Exercise
exports.performExercise = async (req, res, next) => {
  try {
    // Getting Exercise Id form Params
    const exerciseId = req.params.exerciseId;

    // Getting Action from query (Start / Stop)
    const action = req.query.action;

    // Getting Exercise Item To Be Perform
    const exerciseItem = await Exercise.findOne({ _id: exerciseId });

    if (!exerciseItem) {
      throw new Error();
    }
    // Getting Existing Performed Count To Update
    let performedCount = exerciseItem.performedCount;

    function startCounter() {
      start = new Date();
    }

    function stopCounter() {
      stop = new Date();
      elapsed = stop.getTime() - start.getTime();
    }

    // function resetCounter() {
    //   elapsed = 0;
    // }

    function getElapsed() {
      const seconds = Math.floor(elapsed / 1000);
      console.log(seconds);
      return seconds;
    }

    // If The Action is Start. Start the exercise
    if (action === 'start') {
      startCounter();
      // Checking if Another Exercise is being performed or not
      if (req.session.isPerformingExercise) {
        return res
          .status(400)
          .send({ message: 'Another exercise is already being performed.' });
      }
      // Setting the flag to true to indicate that an exercise is being performed
      req.session.isPerformingExercise = true;
      performedCount++;
      return res
        .status(200)
        .json({ message: 'Exercise Started', ExerciseItem: exerciseItem });
    } else if (action === 'stop') {
      stopCounter();
      // Reset the flag to false when the exercise is finished
      req.session.isPerformingExercise = false;
      const currentTotalTime = getElapsed();

      // Saving Total Duration of Exercise in DB
      try {
        console.log('Current Exercise Duration: ', currentTotalTime);
        const prevExerciseDuration = exerciseItem.duration;
        const currExerciseDuration = currentTotalTime;

        const totalExerciseTime = addTimeHelper.addTime(
          prevExerciseDuration,
          currExerciseDuration
        );

        exerciseItem.duration = totalExerciseTime;
        exerciseItem.performedCount = performedCount + 1;
        const result = await exerciseItem.save();
        if (!result) {
          console.log('Error While Saving Duration and Performed Count');
        }

        res.status(200).json({
          message: 'Exercise Stopped',
          TotalTime: currentTotalTime,
        });

        // Saving the Performed Exercise Details To User
        try {
          const workout = await Workout.findById(exerciseItem.workoutId);
          if (!workout) {
            return console.log('Workout Item Note Found From User');
          }
          const user = await User.findOne({ email: req.session.user.email });

          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          let userPrevExeDuration = 0;
          const performed = user.performed.find((item) =>
            item.exerciseId.equals(exerciseItem._id)
          );

          if (performed) {
            userPrevExeDuration = performed.duration;
          }

          const totalUserExerciseTime = addTimeHelper.addTime(
            userPrevExeDuration,
            currentTotalTime
          );

          const isExerciseExist = user.performed.some((item) =>
            item.exerciseId.equals(exerciseItem._id)
          );
          const isWorkoutExist = user.workoutperformed.some((item) =>
            item.workoutId.equals(workout._id)
          );

          const TotalWorkoutDuration = user.workoutperformed.reduce(
            (acc, curr) => acc + curr.duration,
            0
          );

          if (isExerciseExist && isWorkoutExist) {
            await User.updateOne(
              { _id: user._id, 'performed.exerciseId': exerciseItem._id },
              {
                $set: {
                  'performed.$.exerciseCount': performedCount,
                  'performed.$.duration': totalUserExerciseTime,
                  'workoutperformed.$.duration': TotalWorkoutDuration,
                  'workoutperformed.$.performedCount': 0,
                },
              }
            );
          } else {
            user.performed.push({
              exerciseId: exerciseItem._id,
              exerciseCount: performedCount,
              duration: totalUserExerciseTime,
            });
            user.workoutperformed.push({
              workoutId: workout._id,
              duration: workout.totalDuration,
              performedCount: workout.performedCount,
            });
            await user.save();
          }
        } catch (error) {
          console.log(error);
          next(error);
        }

        // And Also Saving Total Duration of Exercise In Workout Exercise Array
        const workout = await Workout.findOne({ _id: exerciseItem.workoutId });
        if (!workout) {
          return console.log('Workout Item Note Found');
        }
        await Workout.findOneAndUpdate(
          { _id: exerciseItem.workoutId },
          {
            $set: {
              'exercise.$[elem].duration': totalExerciseTime,
            },
          },
          {
            arrayFilters: [{ 'elem._id': exerciseItem._id }],
            upsert: true,
            new: true,
          }
        );
        // And updating the Total Duration of Workout by adding its workout duration
        const exercises = workout.exercise;
        const totalWorkoutDuration = exercises.reduce(
          (acc, curr) => acc + curr.duration,
          0
        );

        await workout.updateOne({
          $set: { totalDuration: totalWorkoutDuration },
        });
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  } catch (error) {
    res.status(404).json({ message: 'Exercise Not Found With Provided ID' });
  }
};

// for Listing / Fetching User Performed Workouts
exports.getWorkout = async (req, res, next) => {
  // console.log(req.query);
  const mode = req.query.mode;
  const sortby = req.query.sortby;
  const sortFields = sortby.split(',');

  try {
    // Getting The Post Which Are Performed By the user
    const user = await User.findOne({
      email: req.session.user.email,
    });

    let sort = {};
    sortFields.forEach((field) => {
      sort[field] = mode;
    });

    const userPerformedWorkouts = user.workoutperformed;

    const workoutIds = await userPerformedWorkouts.map((item) => {
      return item.workoutId;
    });

    const AllUserPerformedWorkouts = await Workout.find({
      _id: { $in: workoutIds },
    }).sort(sort);

    if (!AllUserPerformedWorkouts) {
      return res.status(404).json({
        message: 'There is Some Problem While Fetching User Performed Workouts',
      });
    }

    res.status(200).json({
      message: 'Success',
      UserPerformedWorkouts: AllUserPerformedWorkouts,
    });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ message: 'There is Some Problem While Fetching Exercises' });
  }
};

// for Listing / Fetching User Performed Exercises
exports.getExercise = async (req, res, next) => {
  // console.log(req.query);
  const mode = req.query.mode;
  const sortby = req.query.sortby;
  let isRequired;
  const sortFields = sortby.split(',');
  const equipMentRequired = req.query.equipMentRequired;
  if (equipMentRequired) {
    isRequired = JSON.parse(equipMentRequired);
  }

  try {
    // Getting The Post Which Are Performed By the user
    const user = await User.findOne({
      email: req.session.user.email,
    });
    const userPerformedExercises = user.performed;

    const exerciseIds = await userPerformedExercises.map((item) => {
      return item.exerciseId;
    });

    // Create a dynamic sort object based on the sortFields array
    let sort = {};
    sortFields.forEach((field) => {
      sort[field] = mode;
    });

    // Checking If The equipMentRequired parameter is passed or not as it is OPTIONAL
    const userPerformedExercisesQuery = {};
    if (equipMentRequired) {
      userPerformedExercisesQuery.equipMentRequired = isRequired;
    }

    const AllUserPerformedExercises = await Exercise.find(
      userPerformedExercisesQuery
    ).sort(sort);

    if (!AllUserPerformedExercises) {
      return res.status(404).json({
        message:
          'There is Some Problem While Fetching User Performed Exercises',
      });
    }

    res.status(200).json({
      message: 'Success',
      UserPerformedExercises: AllUserPerformedExercises,
    });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ message: 'There is Some Problem While Fetching Exercises' });
  }
};

exports.getTotalPerformed = async (req, res, next) => {
  try {
    // Getting The Number of Workout and Exercise Performed Count
    const user = await User.findOne({
      email: req.session.user.email,
    });

    const userPerformedExercises = user.performed;
    const userPerformedWorkouts = user.workoutperformed;

    // Calculating Total Exercise Duration Performed By User
    const TotalExerciseDuration = userPerformedExercises.reduce(
      (acc, curr) => acc + curr.duration,
      0
    );
    // Calculating Total Workout Duration Performed By User
    const TotalWorkoutDuration = userPerformedWorkouts.reduce(
      (acc, curr) => acc + curr.duration,
      0
    );

    if (userPerformedExercises.length === 0 || TotalExerciseDuration === 0) {
      return res.status(200).json({
        message:
          'You Have Not Performed Any Exercises Yet, Perform some Exercises',
      });
    }

    res.status(200).json({
      message: 'Success',
      ExercisePerformed: userPerformedExercises.length,
      TotalExerciseDuration: TotalExerciseDuration,
      WorkoutPerformed: userPerformedWorkouts.length,
      TotalWorkoutDuration: TotalWorkoutDuration,
    });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ message: 'There is Some Problem While Fetching Details' });
  }
};
