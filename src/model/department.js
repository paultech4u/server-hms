const mongoose = require("mongoose");
const { DEPARTMENT_TYPE } = require("../constants");
const { CARDIOLOGIST, SURGEON, DERMATOLOGIST, RADIOLOGIST } = DEPARTMENT_TYPE;
const { Schema } = mongoose;

const DEPARTMENT_SCHEMA = new Schema(
  {
    name: {
      type: String,
      enum: [CARDIOLOGIST, SURGEON, DERMATOLOGIST, RADIOLOGIST],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 50,
      minlength: 10,
    },
  },
  { timestamps: true }
);

const departments = mongoose.model("Department", DEPARTMENT_SCHEMA);

module.exports = {
  departments,
};
