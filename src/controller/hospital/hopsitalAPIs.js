import express from "express";
import { body } from "express-validator";
import { HospitalRegistration } from "../hospital/hospital";
import { isAuth } from "../../security/auth/authMiddleware";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").isString().trim(),
    body("email").isEmail().trim(),
    body("state").trim(),
    body("address").not().isEmpty().trim(),
    // body("zip_code").isPostalCode("any").withMessage("Invalid zip_code").trim(),
  ],
  isAuth,
  HospitalRegistration
);

export default router;
