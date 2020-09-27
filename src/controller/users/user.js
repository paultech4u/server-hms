import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../model/user";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../security/auth/jwt";
import { Department } from "../../model/department";
import { error } from "../../util/error";
import { VerifyEmail } from "../../service/sendemail";

const { JWT_SECRET_KEY } = process.env;

export const signUp = async (req, res, next) => {
  const {
    fullName,
    userName,
    email,
    password,
    phoneNumber,
    role,
    department,
  } = req.body;

  // TODO check if department exists
  try {
    const departments = await Department.findOne().where({
      departmentName: department,
    });
    if (!departments) {
      error(400, "DEPARTMENT_NOT_FOUND");
    }
    const isExits = await User.findOne({ email: email });
    if (isExits) {
      error(400, "EMAIL_EXISTS");
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const accessToken = jwt.sign(
      {
        email: email,
        fullName: fullName,
        userName: userName,
        password: hashPassword,
        phoneNumber: phoneNumber,
        role: role,
        department: department,
      },
      JWT_SECRET_KEY,
      { expiresIn: "1m" }
    );
    // TODO send a comfirmation message
    VerifyEmail(email, req.hostname, accessToken, fullName);
    return res.status(200).json({
      message: "VERIFICATION_MESSAGE_SENT",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }

    next(error);
  }
};

// TODO verify a new user account
export const verifyAccount = async (req, res, next) => {
  // TODO get id token from the http header query.
  const token = req.query.token;
  if (!token) {
    error(404, "ID_TOKEN_NOT_FOUND");
  }
  let decodedToken;
  try {
    // TODO verify id token.
    decodedToken = verifyAccessToken(token);
    if (!decodedToken) {
      error(401, "INVALID_ID_TOKEN");
    }
    const {
      email,
      fullName,
      userName,
      password,
      phoneNumber,
      role,
      department,
    } = decodedToken;
    const newUser = new User({
      email: email,
      fullName: fullName,
      userName: userName,
      password: password,
      phoneNumber: phoneNumber,
      role: role,
      department: department,
    });
    const user = await User.findOne({ email: email });
    if (!user) {
      newUser.isVerified = true;
      newUser.save();
      const userDep = await Department.findOne({
        departmentName: department,
      });
      userDep.users.push(newUser);
      userDep.save();
      return res.status(200).json({
        message: "EMAIL_VERIFIED",
        payload: newUser,
      });
    } else if (user) {
      error(400, "USER_EXISTS");
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, phoneNumber, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    if (!user) {
      error(404, "EMAIL_NOT_FOUND");
    }
    if (!user.isVerified) {
      return res.status(401).json({
        message: "EMAIL_NOT_VERIFIED",
      });
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      error(401, "INVALID_PASSWORD");
    }
    const payload = {
      _id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      department: user.department,
      role: user.role,
      status: user.status,
    };
    const accessToken = signAccessToken(user._id, payload);
    const refreshToken = signRefreshToken(user._id, payload);
    user.status = true;
    user.save();
    res.status(200).json({
      message: "LOGIN_SUCCESSFUL",
      accessToken: accessToken,
      refreshToken: refreshToken,
      payload: user,
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
export const getProfile = async (req, res, next) => {
  const { userId } = req;
  // TODO check if user is authenticated
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      error(404, "USER_NOT_FOUND");
    }
    res.status(200).json({ message: "SUCCESSFUL", profile: user });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  const { refToken } = req.body;
  try {
    if (!refToken) {
      error(401, "INVALID_REFRESH_TOKEN");
    }
    const userId = verifyRefreshToken(refToken);
    const user = await User.findById(userId);
    if (user.status !== true) {
      return res.status(401, "USER_NOT_AUTHENTICATED");
    }
    if (user.isVerified !== true) {
      return res.status(401, "USER_NOT_AUTHENTICATED");
    }
    const payload = {
      _id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      department: user.department,
      role: user.role,
      status: user.status,
    };
    const accessToken = signAccessToken(userId, payload);
    const refreshToken = signRefreshToken(userId, payload);
    res.status(200).json({
      message: "SUCCESS",
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: user._id,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const deactivateAccount = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      error(404, "USER_NOT_FOUND");
    }
    user.status = false;
    user.isVerified = false;
    user.save();
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  const { userId } = req.query;
  const { adminId } = req.params;
  try {
    const role = await User.findOne({
      _id: adminId,
    });
    if (role.role[0] !== "ADMIN" || !role) {
      return res.status(401).json({
        message: "UNAUTHORIZED",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      error(404, "USER_NOT_FOUND");
    }
    const userDep = await Department.findOne({
      departmentName: user.department,
    });
    userDep.users.pull(user);
    userDep.save();
    user.remove();
    res.status(200).json({ message: "SUCCESSFUL" });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      error(404, "USER_NOT_FOUND");
    }
    user.status = false;
    user.save();
    res.status(200).json({
      message: "SUCCESSFUL!",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
