import express from "express";
import { body, check } from "express-validator";
import {
  signUp,
  verifyAccount,
  login,
  get_profile,
  deactivate_account,
  delete_account,
} from "../controller/users/user";
import User from "../model/user";
import { error } from "../util/error";
import { isAuth } from "../security/auth/isAuth";
const router = express.Router();

router.put(
  "/user/signup",
  [
    check("email")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user.email === req.body.email) {
          error(406, "email exists");
        }
      })
      .not()
      .isEmpty()
      .normalizeEmail({ all_lowercase: true })
      .trim(),
    check("phoneNumber").custom(async (value) => {
      const phone = await User.findOne({ phoneNumber: value });
      if (phone) {
        error(406, "email exists");
      }
    }),
    check("password")
      .isLength({ min: 8 })
      .matches("/d/")
      .withMessage("must contain a number")
      .not()
      .isEmpty()
      .trim(),
    body("role").not().isEmpty().trim(),
    body("fullname").not().isEmpty().trim(),
    body("department").not().isEmpty().trim(),
  ],
  signUp
);

router.get("/user/verify-email", verifyAccount);

router.post("/user/login", login);

router.get("/user/profile", isAuth, get_profile);

router.post("/user/deactivate-account", isAuth, deactivate_account);

router.delete("/user/delete-account/:adminId", delete_account);

export default router;
