import mongoose from "mongoose";

const { Schema } = mongoose;

const ADMIN_SCHEMA = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String || Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
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
  { timestamps: true, collection: "admins", autoCreate: true }
);

export const Admin = mongoose.model("Admin", ADMIN_SCHEMA);
