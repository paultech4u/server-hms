import mongoose from "mongoose";

const { Schema } = mongoose;

const ADMIN_SCHEMA = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, _id: false }
);

export const Admin = mongoose.model("Admins", ADMIN_SCHEMA);
