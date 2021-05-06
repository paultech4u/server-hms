import mongoose from 'mongoose';

const { Schema } = mongoose;

const ADMIN_SCHEMA = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    isAdmin: {
      type: Schema.Types.Boolean,
      required: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      required: false,
    },
  },
  { timestamps: true, _id: false }
);

export const Admin = mongoose.model('Admins', ADMIN_SCHEMA);
