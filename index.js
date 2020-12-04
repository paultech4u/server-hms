import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import DATABASE from "./src/database/db";
import USER_ROUTE from "./src/controller/users/userAPIs";
import DEPARTMENT_ROUTE from "./src/controller/departments/departmentAPIs";
import HOSPITAL_ROUTE from "./src/controller/hospital/hopsitalAPIs";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.use(cors());

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
