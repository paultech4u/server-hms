import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { Response, Request } from 'express';
import { Hospital } from '../../model/hospital';
import { ErrorException } from '../../util/error';
import { Department } from '../../model/department';
import { validationResult } from 'express-validator';
import { VerificationMail } from '../../service/sendgrid';

const { JWT_SECRET_KEY } = process.env;

/**
 * @global
 * @author  Paulsimon Edache
 */

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const UserSignup = async function (req, res, next) {
  const {
    role,
    email,
    lastname,
    username,
    password,
    firstname,
    phone_number,
    hospital_name,
    department_name,
  } = req.body;

  // Express validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }

  try {
    let new_user = null;
    let new_admin = null;
    let admin_role_types = ['Admin', 'ADMIN', 'admin'];

    // Check if user exist
    const user = await User.findOne({ email: email });
    if (user) {
      ErrorException(302, 'Email exists');
    }

    const hospitals = await Hospital.findOne({ name: hospital_name });

    if (!hospitals) {
      ErrorException(404, 'Hospital does not exist');
    }

    const hashed_password = await bcrypt.hash(password, 10);

    // Query for admin role type for valid user role types
    if (role === admin_role_types.find((values) => values === role)) {
      new_user = new User({
        email,
        firstname,
        lastname,
        username,
        password: hashed_password,
        phone_number,
        role: role,
      });
      new_user.save();
      new_admin = new Admin({
        _id: new_user._id,
        hospital: hospitals._id,
        isAdmin: true,
      });
      new_admin.save();
      hospitals.admin = new_admin._id;
      hospitals.save();
      return res.status(200).json({
        message: 'Ok',
      });
    }

    // Query for an existing department
    const departments = await Department.findOne({ name: department_name });
    if (!departments) {
      ErrorException(404, 'Departments does not exist');
    }

    new_user = new User({
      email,
      firstname,
      lastname,
      username,
      password: hashed_password,
      phone_number,
      role: role,
      hospital: hospitals._id,
      department: departments._id,
    });
    await new_user.save();
    const accessToken = jwt.sign(
      {
        _id: new_user._id,
      },
      JWT_SECRET_KEY,
      { expiresIn: '10m' }
    );
    // Send a comfirmation message
    VerificationMail(email, req.hostname, accessToken, firstname);
    return res.status(200).json({
      message: 'Confirmation message sent',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
    return error;
  }
};
