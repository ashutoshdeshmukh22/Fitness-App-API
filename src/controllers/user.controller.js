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

    if (exerciseItem) {
      let intervalId;
      let startTime;
      let elapsedTime = 0;
      let minutes = 0;
      let seconds = 0;
      let performedCount = exerciseItem.performedCount;

      const startExercise = () => {
        intervalId = setInterval(() => {
          seconds++;
          currentTotalTime = `${seconds}`;
        }, 1000);
      };

      const stopExercise = () => {
        clearInterval(intervalId);
      };

      // If The Action is Start. Start the exercise
      if (action === 'start') {
        startExercise();
        performedCount++;
        res
          .status(200)
          .json({ message: 'Exercise Started', ExerciseItem: exerciseItem });
      } else if (action === 'stop') {
        stopExercise();
        // Saving Total Duration of Exercise in DB
        console.log('Current Exercise Duration: ', currentTotalTime);
        const prevExerciseDuration = exerciseItem.duration;
        const currExerciseDuration = currentTotalTime;

        const totalExerciseTime = addTimeHelper.addTime(
          prevExerciseDuration,
          currExerciseDuration
        );

        console.log('========Exercise Data===========');
        console.log(totalExerciseTime);
        console.log(prevExerciseDuration);
        console.log(currExerciseDuration);
        console.log('====================================');

        exerciseItem.duration = totalExerciseTime;
        exerciseItem.performedCount = performedCount + 1;
        const result = await exerciseItem.save();
        if (!result) {
          console.log('Error While Saving Duration and Performed Count');
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
            userPrevExeDuration = '0:0';
          }
          console.log('========= USER TIME ============');
          console.log(
            totalUserExerciseTime,
            userPrevExeDuration,
            currentTotalTime
          );
          console.log('====================================');

          const userExerciseItems = user.performed;
          const isExist = await userExerciseItems.find((item) => {
            let exerciseId = item.exerciseId.toString();
            let userPerformedExerciseId = exerciseItem._id.toString();
            if (exerciseId === userPerformedExerciseId) {
              return true;
            }
          });

          //finding related workout ro save in user
          const workout = await Workout.findById(exerciseItem.workoutId);

          if (isExist) {
            // To update existing exercise if exist
            await User.findOneAndUpdate(
              { _id: user._id },
              {
                $set: {
                  'performed.$[elem].exerciseCount': performedCount,
                  'performed.$[elem].duration': totalUserExerciseTime,
                  'workoutperformed.$[elem].duration': 0,
                  'workoutperformed.$[elem].performedCount': 0,
                },
              },
              {
                arrayFilters: [{ 'elem.exerciseId': exerciseItem._id }],
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
          res.status(200).json({
            message: 'Exercise Stopped',
            TotalTime: currentTotalTime,
          });
        } catch (error) {
          console.log('Error', error);
        }
      }
    } else {
      res.status(404).json({ message: 'Exercise Not Found With Provided ID' });
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

  try {
    // Getting The Post Which Are Performed By the user
    const user = await User.findOne({
      email: req.session.user.email,
    });
    const userPerformedExercises = user.performed;

    const exerciseIds = await userPerformedExercises.map((item) => {
      return item.exerciseId;
    });

    const AllUserPerformedExercises = await Exercise.find({
      _id: { $in: exerciseIds },
    }).sort({ [sortby]: mode });

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

    res.status(200).json({
      message: 'Success',
      ExercisePerformed: userPerformedExercises,
      WorkoutPerformed: userPerformedWorkouts,
      TotalExerciseDuration: 0,
    });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ message: 'There is Some Problem While Fetching Details' });
  }
};
