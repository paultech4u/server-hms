const mongoose = require("mongoose");
const { Schema } = mongoose;

const USER = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "users" }
);

module.exports = mongoose.model("User", USER);
