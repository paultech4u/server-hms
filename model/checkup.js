import mongoose from 'mongoose';

const { Schema } = mongoose;

const PRESCRIPTION = new Schema({
  medicine: String,
  noOfDays: Number,
  whenToTake: String,
  beforeMeal: Boolean,
});

const CHECKUP = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    psychiatristId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    symptoms: {
      type: Array,
      required: false,
    },
    diagnosis: {
      type: Array,
      required: false,
    },
    prescription: {
      type: [PRESCRIPTION],
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Checkup = mongoose.model('Checkups', CHECKUP);
