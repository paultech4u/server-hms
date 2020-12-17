import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
// import logger from 'loglevel';
import { DATABASE } from './src/database/db';

import USER_ROUTE from './src/controller/users/userAPIs';
import DEPARTMENT_ROUTE from './src/controller/departments/departmentAPIs';
import HOSPITAL_ROUTE from './src/controller/hospital/hopsitalAPIs';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(cors());

app.use(USER_ROUTE);
app.use(DEPARTMENT_ROUTE);
app.use(HOSPITAL_ROUTE);

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
  DATABASE;
});
