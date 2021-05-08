import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const { DB_HOST } = process.env;

const DatabaseConfig = mongoose
  .connect(DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log(`🚀 Database ready`);
  })
  .catch((error) => {
    console.log(error);
  });

export default DatabaseConfig;
