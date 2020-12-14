import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const { DB_HOST } = process.env;

export const DATABASE = mongoose
  .connect(DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log(`🚀 database ready`);
  })
  .catch((error) => {
    console.log(error);
  });
