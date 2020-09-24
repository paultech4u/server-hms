import express from "express";
import { body, check } from "express-validator";
import { signUp, verifyAccount } from "../controller/users/user";
import User from "../model/user";
import { error } from "../util/error";
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

export default router;
