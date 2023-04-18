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

    let intervalId;
    let seconds = 0;
    let performedCount = exerciseItem.performedCount;
    let TotalWorkoutDuration;

    const startExercise = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          seconds++;
          currentTotalTime = `${seconds}`;
        }, 1000);
      }
    };

    const stopExercise = () => {
      clearInterval(intervalId);
      intervalId = null;
    };

    // If The Action is Start. Start the exercise
    if (action === 'start') {
      startExercise();
      performedCount++;
      return res
        .status(200)
        .json({ message: 'Exercise Started', ExerciseItem: exerciseItem });
    } else if (action === 'stop') {
      stopExercise();

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

        // And Also Saving Total Duration of Exercise In Workout Exercise Array
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
      } catch (error) {
        console.log(error);
        next(error);
      }

      // And updating the Total Duration of Workout by adding its workout duration
      const workout = await Workout.findById(exerciseItem.workoutId);
      try {
        const exercises = workout.exercise;

        TotalWorkoutDuration = exercises.reduce(
          (acc, curr) => acc + curr.duration,
          0
        );
        workout.totalDuration = TotalWorkoutDuration;
        workout.save();
      } catch (error) {
        console.log(error);
        next(error);
      }

      // Saving the Performed Exercise Details To User
      try {
        const user = await User.findOne({ email: req.session.user.email });
        let userPrevExeDuration;
        await user.performed.find((item) => {
          let exerciseId = exerciseItem._id.toString();
          let userPerformedId = item.exerciseId.toString();
          if (exerciseId === userPerformedId) {
            userPrevExeDuration = item.duration;
          }
        });

        const totalUserExerciseTime = addTimeHelper.addTime(
          userPrevExeDuration,
          currentTotalTime
        );
        if (userPrevExeDuration === undefined) {
          userPrevExeDuration = 0;
        }

        const userExerciseItems = user.performed;
        const isExerciseExist = await userExerciseItems.find((item) => {
          let exerciseId = item.exerciseId.toString();
          let userPerformedExerciseId = exerciseItem._id.toString();
          if (exerciseId === userPerformedExerciseId) {
            return true;
          }
        });

        const userWorkoutItems = user.workoutperformed;
        const isWorkoutExist = await userWorkoutItems.find((item) => {
          let workoutId = item.workoutId.toString();
          let userPerformedWorkouts = workout._id.toString();
          if (workoutId === userPerformedWorkouts) {
            return true;
          }
        });

        const userPerformedWorkouts = user.workoutperformed;
        const TotalWorkoutDuration = userPerformedWorkouts.reduce(
          (acc, curr) => acc + curr.duration,
          0
        );

        if (isExerciseExist && isWorkoutExist) {
          // To update existing exercise if exist
          await User.findOneAndUpdate(
            { _id: user._id },
            {
              $set: {
                'performed.$[elem].exerciseCount': performedCount,
                'performed.$[elem].duration': totalUserExerciseTime,
                'workoutperformed.$[elem].duration': TotalWorkoutDuration,
                'workoutperformed.$[elem].performedCount': 0,
              },
            },
            {
              arrayFilters: [{ 'elem._id': exerciseItem._id }],
              upsert: true,
              new: true,
            }
          );
        } else {
          // To add new Exercise if does not exist
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
        return res.status(200).json({
          message: 'Exercise Stopped',
          TotalTime: currentTotalTime,
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

  try {
    // Getting The Post Which Are Performed By the user
    const user = await User.findOne({
      email: req.session.user.email,
    });
    const userPerformedWorkouts = user.workoutperformed;

    const workoutIds = await userPerformedWorkouts.map((item) => {
      return item.workoutId;
    });

    const AllUserPerformedWorkouts = await Workout.find({
      _id: { $in: workoutIds },
    }).sort({ [sortby]: mode });

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
  const sortFields = sortby.split(',');
  console.log(sortFields);

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
    console.log('====================================');
    console.log(sort);
    console.log('====================================');

    const AllUserPerformedExercises = await Exercise.find({
      _id: { $in: exerciseIds },
    }).sort(sort);

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
  // console.log(req.query);
  const mode = req.query.mode;
  const sortby = req.query.sortby;

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
