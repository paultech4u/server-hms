import mongoose from "mongoose";
import { USER_ROLE } from "../constants";

const { ADMIN } = USER_ROLE;
const { Schema } = mongoose;

const DEPARTMENT_SCHEMA = new Schema(
  {
    departmentName: {
      type: String,
      required: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 50,
      minlength: 10,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    creator: {
      role: {
        type: [ADMIN],
        required: true,
      },
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Department = mongoose.model("Department", DEPARTMENT_SCHEMA);
