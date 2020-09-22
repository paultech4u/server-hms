const express = require("express");
const router = express.Router();
const { body, check, validationResult } = require("express-validator");
const department = require("../controller/departments/department");

router.post(
  "/department",
  [body("name").trim().notEmpty(), body("description").notEmpty().trim()],
  department.create_department
);

router.get("/departments", department.get_departments);

router.get("/departments/:departmentId", department.get_department);

router.delete("/departments/:departmentId", department.delete_department);

module.exports = router;
