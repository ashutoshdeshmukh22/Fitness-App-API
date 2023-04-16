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
    },
    ageGroup: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
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
      required: true,
    },
    equipMentRequired: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
