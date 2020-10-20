import express from "express";
import { body, check } from "express-validator";
import {
  delete_department,
  edit_department,
  create_department,
  get_departments,
  get_department,
} from "../controller/departments/department";
import { isAuth } from "../security/auth/isAuth";
const router = express.Router();

router.post(
  "/department/create-department",
  [
    body("departmentName").trim().notEmpty(),
    body("description").notEmpty().trim(),
  ],
  create_department
);

router.get("/department", get_departments);

router.get("/department/:id", get_department);

router.put("/department/:id", edit_department);

router.delete("/department/:id", isAuth, delete_department);

export default router;
