import mongoose from "mongoose";
import { USER_ROLE } from "../constants";

const { Schema } = mongoose;
const { ACCOUNTANT, DOCTOR, NURSE, PHARMACIST } = USER_ROLE;

const USER = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      first: {
        type: String,
        required: true,
      },
      middle: {
        type: String,
        required: false,
      },
      sur: {
        type: String,
        required: true,
      },
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
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
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
  { timestamps: true, collection: "users" }
);

export const User = mongoose.model("User", USER);
