import mongoose from "mongoose";
const { Schema } = mongoose;

const DEPARTMENT_SCHEMA = new Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: false,
      // maxlength: 50,
      // minlength: 10,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, autoCreate: true }
);

export const Department = mongoose.model("Department", DEPARTMENT_SCHEMA);
