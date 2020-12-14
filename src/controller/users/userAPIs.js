import express from "express";
import {
  UserLogin,
  UserSignup,
  UserLogout,
  UserDelete,
  RefreshToken,
  UserGetProfile,
  UserResetPassword,
  UserForgetPassword,
  UserEmailVerification,
  UserAccountDeactivattion,
} from "./user";
import { UploadProfilePicture } from "./userUpload";
import { MakeUserAdmin } from "./userAdmin";
import { body, check } from "express-validator";
import { isAuth } from "../../security/auth/authMiddleware";
import { uploads } from "../../service/multer";
const router = express.Router();

router.post(
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
    body(["role", "firstname", "surname", "username", "department"])
      .not()
      .isEmpty()
      .trim()
      .withMessage("must contain a character"),
  ],

  UserSignup
);

router.get("/user/confirm-email", UserEmailVerification);

router.post(
  "/user/login",
  check("email").not().isEmpty().normalizeEmail().trim(),
  UserLogin
);

router.get("/user/get-profile", isAuth, UserGetProfile);

router.post("/refresh-token", RefreshToken);

router.put("/user/deactivate", isAuth, UserAccountDeactivattion);

router.post("/admin", MakeUserAdmin);

router.put(
  "/user/reset-password",
  [body("password").not().isEmpty().isLength({ max: 30, min: 8 }).trim()],
  isAuth,
  UserResetPassword
);

router.put(
  "/forget-password",
  [
    body(["newPassword", "tel", "email"])
      .not()
      .isEmpty()
      .trim()
      .withMessage("must contain a character value"),
    body("tel")
      .isNumeric()
      .isMobilePhone()
      .withMessage("must be a valid mobile number"),
  ],
  UserForgetPassword
);

router.put(
  "/user/profile",
  uploads.single("avatar"),
  isAuth,
  UploadProfilePicture
);

router.delete("/user/delete/:adminId", isAuth, UserDelete);

router.post("/user/logout", isAuth, UserLogout);

export default router;
