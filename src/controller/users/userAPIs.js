import express from "express";
import { body, check } from "express-validator";
import {
  admin,
  userLogin,
  userDelete,
  userSignup,
  userLogout,
  refreshToken,
  userGetProfile,
  userDeactivate,
  userVerification,
  userResetPassword,
  userForgetPassword,
} from "./user";
import { isAuth } from "../../security/auth/isAuth";
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
      .isLength({ min: 8, max: 20 })
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
  userSignup
);

router.get("/user/confirm-email", userVerification);

router.post(
  "/user/login",
  check("email").not().isEmpty().normalizeEmail().trim(),
  userLogin
);

router.get("/user/profile", isAuth, userGetProfile);

router.post("/:token", refreshToken);

router.put("/user/deactivate", isAuth, userDeactivate);

router.post("/admin", admin);
router.put(
  "/user/reset-password",
  [body("password").not().isEmpty().isLength({ max: 30, min: 8 }).trim()],
  isAuth,
  userResetPassword
);
router.put(
  "/forget-password",
  [
    body(["newPass", "tel", "email"])
      .not()
      .isEmpty()
      .trim()
      .withMessage("must contain a character value"),
    body("tel")
      .isNumeric()
      .isMobilePhone()
      .withMessage("must be a valid mobile number"),
  ],
  userForgetPassword
);

router.delete("/user/delete/:adminId", userDelete);

router.post("/user/logout", isAuth, userLogout);

export default router;
