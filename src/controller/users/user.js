import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
import { EmailConfirmation } from "../../service/sendgrid";
import { Hospital } from "../../model/hospital";
import { validationResult } from "express-validator";

const { JWT_SECRET_KEY } = process.env;
/**
 * @global
 * @param  {Object} req - request object
 * @param  {string} req.body
 * @param  {Object} res - response object
 * @param  {Function} next - middleware
 */


export const signUp = async (req, res, next) => {
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
    if (!departments) {
      error(400, "Department not found");
    }
    const hospitals = await Hospital.findOne({ name: hospital });
    if (!hospitals) {
      error(400, "Hospital not found");
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
    EmailConfirmation(email, req.hostname, accessToken, firstname);
    return res.status(200).json({
      message: "Confirmation message sent",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }

    next(error);
  }
};

// TODO verify a new user account
export const confirm_email = async (req, res, next) => {
  // TODO get id token from the http header query.
  const { token } = req.query;
  if (!token) {
    error(404, "IdToken not found");
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
      return res.status(200).json({
        message: "Invalid user id",
      });
    }
    user.isVerified = true;
    const [newUser] = await Promise.all([user.save()]);
    if (newUser) {
      return res.status(200).json({
        message: "Email verified",
        payload: newUser,
      });
    }
    return res.status(401).json({
      message: "Email not verified",
    });
  } catch (error) {
    console.log(error);
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, tel, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: email }, { tel: tel }],
    });
    if (!user) {
      error(404, "User not found");
    }
    if (user.isVerified === false) {
      return res.status(401).json({
        message: "Email not verified",
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
    user.isActive = true;
    user.save();
    res.status(200).json({
      message: "Successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: user._id,
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
  // TODO check if user is authenticated{
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      error(404, "User not found");
    }
    res.status(200).json({ message: "Successful", profile: user });
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
      error(401, "No refresh token");
    }
    const userId = verifyRefreshToken(refToken);
    const user = await User.findById(userId);
    if (user.isActive !== true && user.isVerified !== true) {
      return res.status(401, "User not authenticated");
    }
    const payload = {
      _id: user.id,
      isActive: true,
    };
    const accessToken = signAccessToken(userId, payload);
    const refreshToken = signRefreshToken(userId, payload);
    res.status(200).json({
      message: "Success",
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: user._id,
      user: user,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      error(404, "User not found");
    }
    user.isActive = false;
    user.isVerified = false;
    user.save();
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.query;
  const { adminId } = req.params;
  try {
    const admin = await Admin.findOne({
      _id: adminId,
    });
    if (admin.isAdmin === false) {
      return res.status(401).json({
        message: "Unauthorized",
      });
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
    const checkAdmin = (arr) => {
      for (let x in arr) {
        return x._id === admin._id;
      }
    };
    isAdmin = hospital.admins;
    if (checkAdmin(isAdmin)) {
      hospital.admins.pull(admin._id);
      hospital.save();
      user.remove();
      res.status(200).json({ message: "Success" });
    }
    user.remove();
    return res.status(200).json({ message: "Success" });
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
            message: "User is already an admin",
          });
        }
        const hospId = await Hospital.findById(user.hospital);
        if (!hospId) {
          return res.status(404).json({
            message: "Hospital does not exist",
          });
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
          return res.status(200).json({
            message: "Successful",
          });
        }
        return res.status(200).json({
          message: "Unsuccessful",
        });
      } else {
        return res.status(302).json({
          message: "User is not entitled",
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

export const password_reset = async (req, res, next) => {
  const { oldPass, newPass, tel, email } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(406).json({
        message: errors.mapped(),
      });
    }
    const user = await User.findOne({ tel: tel }).or([{ email: email }]);
    if (!user) {
      res.status(404).json({
        message: `${email} is not a registered address`,
      });
    }
    const isEqual = await bcrypt.compare(newPass, user.password);
    console.log(isEqual);
    if (isEqual) {
      return res.status(406).json({
        message: "new password must not be the same with the old password",
      });
    }
    const hashPassword = await bcrypt.hash(newPass, 10);
    user.password = hashPassword;
    const [u] = await Promise.all([user.save()]);
    if (u) {
      return res.status(200).json({
        message: "Ok",
      });
    }
    return res.status(406).json({
      message: "Unsuccessful",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const change_password = async (req, res, next) => {
  const { userId } = req;
  const { newPass } = req.body;
  if (!userId) {
    return res.status(407).json({
      message: "Not authenticated",
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const isEqual = await bcrypt.compare(newPass, user.password);
    if (isEqual) {
      return res.status(406).json({
        message: "new password must not be the same with the old password",
      });
    }
    const hashPassword = await bcrypt.hash(newPass, 10);
    user.password = hashPassword;
    const [u] = await Promise.all([user.save()]);
    if (u) {
      return res.status(200).json({
        message: "Ok",
      });
    }
    return res.status(406).json({
      message: "Unsuccessful",
    });
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
      error(404, "User not found");
    }
    user.isActive = false;
    user.save();
    res.status(200).json({
      message: "Successful!",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
