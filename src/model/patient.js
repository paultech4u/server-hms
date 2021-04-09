import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const PATIENTS = new Schema({
  _id: {
    type: Number,
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
  middlename: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
    default: null,
  },
  phoneNumber: {
    type: Number,
    required: false,
  },
  email: {
    type: Number,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  status: {
    type: Boolean,
    default: false,
  },
  bloodGroup: {
    type: String,
    required: false,
  },
});

export const Patient = model('Patients', PATIENTS);
