import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../model/user";
import { Admin } from "../../model/admin";
import { Response, Request } from "express";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./userService";
import { Hospital } from "../../model/hospital";
import { ErrorException } from "../../util/error";
import { Department } from "../../model/department";
import { validationResult } from "express-validator";
import { VerificationMail } from "../../service/sendgrid";

const { JWT_SECRET_KEY } = process.env;

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const UserSignup = async function (req, res, next) {
  const {
    firstname,
    surname,
    username,
    email,
    password,
    tel,
    hospital,
    role,
    department,
  } = req.body;

  try {
    // TODO check if department exists
    const departments = await Department.findOne({ name: department });
    const hospitals = await Hospital.findOne({ name: hospital });
    if (!departments || !hospitals) {
      ErrorException(
        404,
        `${
          !departments === false ? "Hospital not found" : "Department not found"
        }`
      );
    }
    const user = await User.findOne({ email: email });
    if (user) {
      ErrorException(302, "User exists");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      firstname,
      surname,
      username,
      password: hashPassword,
      tel: tel,
      role: role,
      // imageUrl: imageUrl.path,
      hospital: hospitals._id,
      department: departments,
    });
    await newUser.save();
    const accessToken = jwt.sign(
      {
        _id: newUser._id,
      },
      JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
    // TODO send a comfirmation message
    VerificationMail(email, req.hostname, accessToken, firstname);
    res.status(200).json({
      message: "Confirmation message sent",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
    return error;
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
export const UserEmailVerification = async function (req, res, next) {
  // TODO verify a new user account
  // TODO get id token from the http query string.
  const { token } = req.query;
  if (!token) {
    ErrorException(404, "Token ID not found");
  }
  let decodedToken;
  try {
    // TODO verify id token.
    decodedToken = verifyAccessToken(token);
    if (!decodedToken) {
      ErrorException(401, "Invalid token");
    }
    const { _id } = decodedToken;
    const user = await User.findById({ _id: _id });
    if (!user) {
      ErrorException(404, "User not found");
    }
    user.isVerified = true;
    const [newUser] = await Promise.all([user.save()]);
    if (!newUser) {
      ErrorException(401, "Email not verified");
    }
    res.status(200).json({
      message: "Email verified",
      payload: newUser,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
    return error;
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
export const UserLogin = async function (req, res, next) {
  const { email, tel, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: email }, { tel: tel }],
    });
    if (!user) {
      ErrorException(404, "User not found");
    }
    if (user.isVerified === false) {
      ErrorException(401, "Email not verified");
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      ErrorException(401, "Wrong password");
    }
    const payload = {
      _id: user.id,
      isActive: true,
    };
    const accessToken = signAccessToken(user._id, payload);
    const refreshToken = signRefreshToken(user._id, payload);
    const verifyToken = verifyAccessToken(accessToken);
    user.isActive = true;
    user.save();
    res.status(200).json({
      message: "Ok",
      email: user.email,
      id: user._id,
      id_token: accessToken,
      expires_in: verifyToken.exp,
      refresh_token: refreshToken,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
export const UserGetProfile = async function (req, res, next) {
  // TODO get a user profile payload from an authorization token
  // TODO if user is authenticated.
  const { userID } = req;
  // TODO check if user exits
  try {
    const user = await User.findOne({ _id: userID })
      .populate("hospital", "name -_id")
      .populate("department", "name -_id")
      .exec();
    if (!user) {
      ErrorException(404, "User not found");
    }
    res.status(200).json({ message: "OK", user: user });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to fetch profile";
    }
    next(error);
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const RefreshToken = async function (req, res, next) {
  const { token } = req.query;
  try {
    if (!token) {
      ErrorException(401, "No refresh token");
    }
    const userID = verifyRefreshToken(token);
    const user = await User.findById(userID);
    if (user.isActive !== true && user.isVerified !== true) {
      res.status(401, "User not authenticated");
    }
    const payload = {
      _id: user.id,
      isActive: true,
    };
    const accessToken = signAccessToken(userID, payload);
    const refreshToken = signRefreshToken(userID, payload);
    const verifyToken = verifyAccessToken(accessToken);
    res.status(200).json({
      message: "OK",
      user_id: user._id,
      expiresIn: verifyToken.exp,
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  } catch (error) {
    if (!error.status) {
      console.log(error);
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next  next middleware function
 */
export const UserAccountDeactivattion = async function (req, res, next) {
  const { userID } = req.body;
  try {
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, "User not found");
    }
    user.isActive = false;
    user.isVerified = false;
    user.save();
    res.status(200).json({
      message: "User disabled",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
export const UserDelete = async function (req, res, next) {
  const { userID } = req.query;
  const { adminID } = req.params;

  try {
    const admin = await Admin.findOne({
      _id: adminID,
    });
    if (admin.isAdmin === false) {
      ErrorException(401, "Unauthorized");
    }
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, "User not found");
    }
    if (adminID === user._id) {
      ErrorException(403, "Forbidden");
    }
    // Todo check hospital admins if user is an admin
    let isAdmin;
    const hospital = await Hospital.findOne({ name: admin.hospital });
    const checkAdmin = (id) => {
      return id === admin._id;
    };
    isAdmin = hospital.admin;
    if (checkAdmin(isAdmin)) {
      hospital.admin = null;
      hospital.save();
      user.remove();
      res.status(200).json({ message: "OK" });
      return;
    }
    await user.remove();
    res.status(200).json({ message: "OK" });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const UserForgetPassword = async function (req, res, next) {
  const { newPassword, mobileNumber, email } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      res.status(406).json({
        error: errors.mapped(),
      });
    }
    const user = await User.findOne({ tel: mobileNumber }).or([
      { email: email },
    ]);
    if (!user) {
      ErrorException(404, "User not found");
    }
    if (email !== user.email) {
      ErrorException(404, `${email} is not a registered email address`);
    }
    if (user.isVerified == false) {
      ErrorException(404, `${email} is not verified`);
    }
    const isMatch = await bcrypt.compare(newPass, user.password);
    if (isMatch) {
      ErrorException(
        406,
        "new password must not be the same with the old password"
      );
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    const [isSaved] = await Promise.all([user.save()]);
    if (isSaved) {
      const payload = {
        _id: user.id,
        isActive: false,
      };
      const accessToken = signAccessToken(user.id, payload);
      const refreshToken = signRefreshToken(user.id, payload);
      const verifyToken = verifyAccessToken(accessToken);
      res.status(200).json({
        message: "OK",
        id_token: accessToken,
        expires_in: verifyToken.exp,
        refresh_token: refreshToken,
      });
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
export const UserResetPassword = async function (req, res, next) {
  const { userID } = req;
  const { newPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  try {
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, "User not found");
    }
    const isEqual = await bcrypt.compare(newPassword, user.password);
    if (isEqual) {
      ErrorException(
        406,
        "new password must not be the same with previous password"
      );
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.save();
    res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.massage = "change cannot be applied";
      next(error);
    }
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const UserLogout = async function (req, res, next) {
  const { userID } = req;
  try {
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, "User not found");
    }
    user.isActive = false;
    user.save();
    res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
