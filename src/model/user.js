import mongoose from "mongoose";
import { USER_ROLE } from "../constants";

const { Schema } = mongoose;
const { ACCOUNTANT, DOCTOR, NURSE, PHARMACIST, ADMIN } = USER_ROLE;

const USER = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: false,
    },
    password: {
      type: String || Number,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    role: {
      type: [ACCOUNTANT, DOCTOR, NURSE, PHARMACIST, ADMIN],
      required: true,
    },
    department: {
      type: Schema.Types.String,
      ref: "Department",
      required: true,
    },
    status: {
      type: Boolean,
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
