import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../model/user";
import { Department } from "../../model/department";
import { error } from "../../util/error";
import { VerifyEmail } from "../../service/sendemail";

const { JWT_API_KEY } = process.env;

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
    const newUser = new User({
      email: email,
      fullName: fullName,
      userName: userName,
      password: hashPassword,
      phoneNumber: phoneNumber,
      role: role,
      department: department,
    });
    const token = jwt.sign(
      {
        _id: newUser.id,
        email: email,
        fullName: fullName,
        phoneNumber: phoneNumber,
        role: role,
        department: department,
        isVerified: newUser.isVerified,
      },
      JWT_API_KEY,
      { expiresIn: "1m" }
    );
    // TODO send a comfirmation message
    VerifyEmail(email, req.hostname, token, fullName);
    // TODO save user
    newUser.save();
    res.status(200).json({
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
  const token = req.query.token;
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWT_API_KEY, (err, decoded) => {
      if (err) {
        return res.status(406).json({
          message: "TOKEN_EXPIRED",
        });
      }
      return decoded;
    });
    if (!decodedToken) {
      error(401, "INVALID_ID_TOKEN");
    }
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      error(400, "USER_NOT_FOUND");
    }
    user.isVerified = true;
    const userDep = await Department.findOne({
      departmentName: decodedToken.department,
    });
    userDep.users.push(decodedToken);
    userDep.save();
    user.save();
    res.status(200).json({
      message: "EMAIL_VERIFIED",
      payload: user,
    });
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
    const token = jwt.sign(
      {
        _id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        department: user.department,
        role: user.role,
        status: user.status,
      },
      JWT_API_KEY,
      { expiresIn: "10m" }
    );
    user.status = true;
    user.save();
    res.status(200).json({
      message: "LOGIN_SUCCESSFUL",
      token: token,
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
export const get_profile = async (req, res, next) => {
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

export const resend_token = async (req, res, next) => {};

export const deactivate_account = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      error(404, "USER_NOT_FOUND");
    }
    user.status = false;
    user.isVerified = false;
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const delete_account = async (req, res, next) => {
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
