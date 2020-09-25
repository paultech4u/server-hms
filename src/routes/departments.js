import express from "express";
import { body, check } from "express-validator";
import {
  delete_department,
  edit_department,
  create_department,
  get_departments,
  get_department,
} from "../controller/departments/department";
const router = express.Router();

router.post(
  "/department",
  [
    body("departmentName").trim().notEmpty(),
    body("description").notEmpty().trim(),
  ],
  create_department
);

router.get("/departments", get_departments);

router.get("/departments/:departmentId", get_department);

router.put("/departments/:departmentId", edit_department);

router.delete("/departments/:departmentId", delete_department);

export default router;
