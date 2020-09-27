import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PATIENTS = new Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  state: {
    name: {
      type: String,
      required: true,
    },
    LGA: {
      type: String,
      required: true,
    },
  },
  nextOfKin: {
    name: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: Number,
      required: false,
    },
  },
});

export const Patient = model("Patient", PATIENTS);
