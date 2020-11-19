import express from "express";
import { body, check } from "express-validator";
import {
  signUp,
  confirm_email,
  login,
  getProfile,
  deactivateUser,
  deleteUser,
  refreshToken,
  password_reset,
  logout,
  admin,
} from "../controller/users/user";
// import User from "../model/user";
// import { error } from "../util/error";
import { isAuth } from "../security/auth/isAuth";
const router = express.Router();

router.put(
  "/user/signup",
  [
    body("email")
      .not()
      .isEmpty()
      .normalizeEmail({ all_lowercase: true })
      .trim(),
    body("tel").isNumeric().isMobilePhone().not().isEmpty(),
    check("password")
      .isLength({ min: 8 })
      .matches("/d/")
      .withMessage("must contain a number")
      .not()
      .isEmpty()
      .trim(),
    body([
      "role",
      "firstname",
      "middlename",
      "surname",
      "username",
      "department",
    ])
      .not()
      .isEmpty()
      .trim()
      .withMessage("must contain a character"),
  ],
  signUp
);

router.get("/user/confirm-email", confirm_email);

router.post(
  "/user/login",
  check("email").not().isEmpty().normalizeEmail().trim(),
  login
);

router.get("/user/profile", isAuth, getProfile);

router.post("/refreshToken", refreshToken);

router.post("/user/deactivate", isAuth, deactivateUser);

router.post("/admin", admin);

router.put(
  "/reset-password",
  [
    body(["newPass", "tel", "email", "oldPass"])
      .not()
      .isEmpty()
      .trim()
      .withMessage("must contain a character value"),
    body("tel")
      .isNumeric()
      .isMobilePhone()
      .withMessage("must be a valid mobile number"),
  ],
  password_reset
);

router.delete("/user/delete/:adminId", deleteUser);

router.post("/user/logout", isAuth, logout);

export default router;
