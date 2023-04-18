const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Full Body', 'Upper Body', 'Lower Body'],
    },
    ageGroup: {
      type: String,
      required: true,
      enum: ['18-45', '45-60', '60+'],
    },
    purpose: {
      type: String,
      required: true,
      enum: ['Weight Loss', 'Weight Gain', 'Stay Fit'],
    },
    exercisesCount: {
      type: Number,
      required: true,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    performedCount: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    exercise: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: 'Exercise',
        },
        duration: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workout', workoutSchema);
