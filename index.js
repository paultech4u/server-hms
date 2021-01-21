import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { DatabaseConfig } from './src/database/config';

import USER_ROUTE from './src/controller/user';
import ADMIN_ROUTE from './src/controller/admin';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(cors());

app.use(USER_ROUTE);
app.use(ADMIN_ROUTE);

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

app.set('trust proxy', (ip) => {
  console.log(ip);
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
  DatabaseConfig;
});
