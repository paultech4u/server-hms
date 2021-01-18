import mongoose from 'mongoose';

const { Schema } = mongoose;

const USER = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: false,
    },
    password: {
      type: String || Number,
      required: true,
    },
    phone_number: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospitals',
      required: false,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Departments',
      required: false,
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    isVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('Users', USER);
