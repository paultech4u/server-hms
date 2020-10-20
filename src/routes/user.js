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
    body("tel").isNumeric({ no_symbols: true }).not().isEmpty(),
    check("password")
      .isLength({ min: 8 })
      .matches("/d/")
      .withMessage("must contain a number")
      .not()
      .isEmpty()
      .trim(),
    body("role").not().isEmpty().trim(),
    body("firstname").not().isEmpty().trim(),
    body("middlename").not().isEmpty().trim(),
    body("surname").not().isEmpty().trim(),
    body("username").not().isEmpty().trim(),
    body("department").not().isEmpty().trim(),
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

router.delete("/user/delete/:adminId", deleteUser);

router.post("/user/logout", isAuth, logout);

export default router;
