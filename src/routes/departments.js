const express = require("express");
const router = express.Router();
const { body, check, validationResult } = require("express-validator");
const department = require("../controller/departments/department");

router.get("/departments", department.get_department);

router.post(
  "/department",
  [
    body("name").not().isEmpty().trim(),
    body("description").not().isEmpty().trim(),
  ],
  department.create_department
);

module.exports = router;
