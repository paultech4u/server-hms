import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import DatabaseConfig from './database/config.js';

import USER_ROUTE from './controller/user/api.js';
import PATIENTS_ROUTE from './controller/patient/api.js';
import HOSPITAL_ROUTE from './controller/hospital/api.js';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cors());

app.use(USER_ROUTE);
app.use(HOSPITAL_ROUTE);
app.use(PATIENTS_ROUTE);

// Error expection handler
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message;
  res.status(status);
  res.send({
    error: {
      status: status,
      message: message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
  DatabaseConfig;
});
