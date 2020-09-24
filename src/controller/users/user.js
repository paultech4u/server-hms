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
      error(400, "department does exists");
    }
    const isExits = await User.findOne({ email: email });
    if (isExits) {
      error(400, "user exists");
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
      },
      JWT_API_KEY,
      { expiresIn: "10m" }
    );
    // TODO send a comfirmation message
    VerifyEmail(email, req.hostname, token, fullName);
    // TODO save user
    newUser.save();
    res.status(200).json({
      message: "Sent a verification message",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const verifyAccount = async (req, res, next) => {
  const token = req.query.token;
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWT_API_KEY);
    if (!decodedToken) {
      error(401, "No token");
    }
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      error(400, "user does exists");
    }
    user.isVerified = true;
    const userDep = await Department.findOne({
      departmentName: decodedToken.department,
    });
    userDep.users.push(decodedToken);
    userDep.save();
    user.save();
    res.status(200).json({
      message: "Successful!",
      newUser: decodedToken,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
