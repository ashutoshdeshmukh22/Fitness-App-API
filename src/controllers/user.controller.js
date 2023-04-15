const Workout = require('../models/workout.model');
const Exercise = require('../models/exercise.model');
const User = require('../models/user.model');

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
        startTime = Date.now() - elapsedTime;
        intervalId = setInterval(() => {
          elapsedTime = Date.now() - startTime;
          minutes = Math.floor(elapsedTime / 60000);
          seconds = Math.floor((elapsedTime % 60000) / 1000);
          totalTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 100);
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
        exerciseItem.duration = totalTime;
        exerciseItem.performedCount = performedCount + 1;
        const result = await exerciseItem.save();
        if (!result) {
          console.log('Error While Saving Duration and Performed Count');
        }

        // Saving the Performed Exercise Details To User
        try {
          const user = await User.findOne({ email: req.session.user.email });

          const item = await User.findOne({
            _id: user._id,
            performed: { $elemMatch: { $eq: exerciseItem._id } },
          });

          console.log('====================================');
          console.log(item);
          console.log('====================================');

          // To update existing exercise if exist
          await User.findOneAndUpdate(
            { _id: user._id },
            {
              $set: {
                'performed.$[elem].exerciseCount': performedCount,
                'performed.$[elem].duration': totalTime,
              },
            },
            {
              arrayFilters: [{ 'elem.exerciseId': exerciseItem._id }],
              upsert: true,
              new: true,
            }
          );

          // To add new Exercise if does not exist

          // user.performed.push({
          //   exerciseId: exerciseItem._id,
          //   exerciseCount: performedCount,
          //   duration: totalTime,
          // });
          // await user.save();
        } catch (error) {
          console.log('Error', error);
        }

        res
          .status(200)
          .json({ message: 'Exercise Stopped', TotalTime: totalTime });
      }
    } else {
      res.status(404).json({ message: 'Exercise Not Found With Provided ID' });
    }
  } catch (error) {
    res.status(404).json({ message: 'Exercise Not Found With Provided ID' });
  }
};
