import mongoose from "mongoose";
const { Schema } = mongoose;

const DEPARTMENT_SCHEMA = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: false,
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
