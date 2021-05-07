import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const HOSPITAL_SCHEMA = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    zip_no: {
      type: Number,
      required: false,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'Admins',
      required: false,
    },
  },
  { timestamps: true }
);

export const Hospital = model('Hospitals', HOSPITAL_SCHEMA);
