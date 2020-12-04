import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../model/user";
import { Admin } from "../../model/admin";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../security/auth/jwt";
import { Department } from "../../model/department";
import { error } from "../../util/error";
import { SendMail } from "../../service/sendgrid";
import { Hospital } from "../../model/hospital";
import { validationResult } from "express-validator";

const { JWT_SECRET_KEY } = process.env;
/**
 * @global
 * @param  {Object} req - request object
 * @param  {Object} res - response object
 * @param  {Function} next - middleware
 */

export const userSignup = async (req, res, next) => {
  const {
    firstname,
    surname,
    middlename,
    username,
    email,
    password,
    tel,
    hospital,
    role,
    department,
  } = req.body;

  // TODO check if department exists
  try {
    const departments = await Department.findOne({ name: department });
    const hospitals = await Hospital.findOne({ name: hospital });
    if (!departments || !hospitals) {
      error(
        404,
        `${
          !departments === false ? "Hospital not found" : "Department not found"
        }`
      );
    }
    const user = await User.findOne({ email: email });
    if (user) {
      error(302, "User exists");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email,
      name: {
        first: firstname,
        middle: middlename,
        sur: surname,
      },
      username: username,
      password: hashPassword,
      tel: tel,
      role: role,
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
    SendMail(email, req.hostname, accessToken, firstname);
    res.status(200).json({
      msg: "Confirmation message sent",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
    return error;
  }
};

// TODO verify a new user account
export const userVerification = async (req, res, next) => {
  // TODO get id token from the http header query.
  const { token } = req.query;
  if (!token) {
    error(404, "Token ID not found");
  }
  let decodedToken;
  try {
    // TODO verify id token.
    decodedToken = verifyAccessToken(token);
    if (!decodedToken) {
      error(401, "Invalid token");
    }
    const { _id } = decodedToken;
    const user = await User.findById({ _id: _id });
    if (!user) {
      error(404, "User not found");
    }
    user.isVerified = true;
    const [newUser] = await Promise.all([user.save()]);
    if (newUser) {
      res.status(200).json({
        msg: "Email verified",
        payload: newUser,
      });
    }
    res.status(401).json({
      msg: "Email not verified",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
    return error;
  }
};

export const userLogin = async (req, res, next) => {
  const { email, tel, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: email }, { tel: tel }],
    });
    if (!user) {
      error(404, "User not found");
    }
    if (user.isVerified === false) {
      res.status(401).json({
        msg: "Email not verified",
      });
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      error(401, "Wrong password");
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
      msg: "Ok",
      email: user.email,
      user_id: user._id,
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

// TODO get a user profile payload from an authorization token
// TODO if user is authenticated.
export const userGetProfile = async (req, res, next) => {
  const { userId } = req;
  // TODO check if user exits
  try {
    const user = await User.findOne({ _id: userId })
      .populate("hospital", "name -_id")
      .populate("department", "name -_id")
      .exec();
    if (!user) {
      error(404, "User not found");
    }
    res.status(200).json({ msg: "OK", user: user });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to fetch profile";
    }
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  const { token } = req.params;
  try {
    if (!token) {
      error(401, "No refresh token");
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
      msg: "OK",
      user_id: user._id,
      expiresIn: verifyToken.exp,
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const userDeactivate = async (req, res, next) => {
  const { user_id } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user) {
      error(404, "User not found");
    }
    user.isActive = false;
    user.isVerified = false;
    user.save();
    res.status(200).json({
      msg: "User disabled",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const userDelete = async (req, res, next) => {
  const { id } = req.query;
  const { adminId } = req.params;
  try {
    const admin = await Admin.findOne({
      _id: adminId,
    });
    if (admin.isAdmin === false) {
      error(401, "Unauthorized");
    }
    const user = await User.findById(id);
    if (!user) {
      error(404, "User not found");
    }
    if (adminId === user._id) {
      error(403, "Forbidden");
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
      res.status(200).json({ msg: "OK" });
      return;
    }
    await user.remove();
    res.status(200).json({ msg: "OK" });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

// Assign a user to be an admin
export const admin = async (req, res, next) => {
  const { id } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      error(404, "User not found");
    }
    if (user) {
      if (user.isAdmin !== true && user.isVerified === true) {
        const email = user.email;
        //  Todo check if user is already an admin
        const admin = await Admin.findOne({ email: email });
        if (admin) {
          return res.status(302).json({
            msg: "User already an admin",
          });
        }
        const hospId = await Hospital.findById(user.hospital);
        if (!hospId) {
          res.status(404).json({
            msg: "Hospital does not exist",
          });
          return;
        }
        // Todo attach user payload to admin model
        const newAdmin = new Admin({
          _id: user._id,
          name: user.username,
          email: user.email,
          // imageUrl: user.imageUrl,
          password: user.password,
          hospital: hospId._id,
          status: true,
          isAdmin: true,
        });
        user.isAdmin = true;
        const [a, u] = await Promise.all([newAdmin.save(), user.save()]);
        if (a && u) {
          res.status(200).json({
            message: "Successful",
          });
          return;
        }
        res.status(200).json({
          msg: "Unsuccessful",
        });
      } else {
        res.status(302).json({
          msg: "User is not entitled",
        });
      }
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const userForgetPassword = async (req, res, next) => {
  const { newPass, tel, email } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      res.status(406).json({
        error: errors.mapped(),
      });
    }
    const user = await User.findOne({ tel: tel }).or([{ email: email }]);
    if (!user) {
      error(404, "User not found");
    }
    if (email !== user.email) {
      error(404, `${email} is not a registered email address`);
    }
    if (user.isVerified == false) {
      error(404, `${email} is not verified`);
    }
    const isMatch = await bcrypt.compare(newPass, user.password);
    if (isMatch) {
      error(406, "new password must not be the same with the old password");
    }
    const hashPassword = await bcrypt.hash(newPass, 10);
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
        msg: "OK",
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

export const userResetPassword = async (req, res, next) => {
  const { userId } = req;
  const { newPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        msg: "User not found",
      });
    }
    const isEqual = await bcrypt.compare(newPassword, user.password);
    if (isEqual) {
      res.status(406).json({
        msg: "new password must not be the same with previous password",
      });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.save();
    res.status(200).json({
      msg: "OK",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.massage = "change cannot be applied";
      next(error);
    }
  }
};

export const userLogout = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      error(404, "User not found");
    }
    user.isActive = false;
    user.save();
    res.status(200).json({
      msg: "OK",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
