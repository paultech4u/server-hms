import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import DATABASE from "./src/database/db";
import USER_ROUTE from "./src/routes/user";
import DEPARTMENT_ROUTE from "./src/routes/departments";
import HOSPITAL_ROUTE from "./src/routes/hospital";

const app = express();

dotenv.config({ path: "./.env" });

const  PORT  = process.env.PORT || 4000;

app.use(bodyParser.json());

// TODO cors configuration.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(USER_ROUTE);
app.use(DEPARTMENT_ROUTE);
app.use(HOSPITAL_ROUTE);

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

app.listen(PORT, () => {
  console.log(`🚀 server ready at port ${PORT}`);
  DATABASE;
});
