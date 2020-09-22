const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

dotenv.config({ path: "./.env" });

const { PORT, DB_HOST } = process.env;

const USER_ROUTE = require("./src/routes/user");
const DEPARTMENT_ROUTE = require("./src/routes/departments");

app.use(bodyParser.json());

// TODO cors configuration.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// app.use(USER_ROUTE);
app.use(DEPARTMENT_ROUTE);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.status || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`🚀 server ready at port 4000`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
