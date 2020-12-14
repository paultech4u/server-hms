import mongoose from "mongoose";
import { USER_ROLE } from "../util/constants";

const { Schema } = mongoose;
const { ACCOUNTANT, DOCTOR, NURSE, PHARMACIST } = USER_ROLE;

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
    surname: {
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
    tel: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    role: {
      type: [ACCOUNTANT, DOCTOR, NURSE, PHARMACIST],
      required: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: false,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
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

export const User = mongoose.model("Users", USER);
