const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const exerciseSchema = new mongoose.Schema(
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
      enum: ['18-45', '45-60', '60+'],
    },
    purpose: {
      type: String,
      required: true,
      enum: ['Weight Loss', 'Weight Gain', 'Stay Fit'],
    },
    performedCount: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    workoutId: {
      type: Schema.Types.ObjectId,
    },
    equipMentRequired: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
