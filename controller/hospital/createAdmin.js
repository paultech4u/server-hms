import bcrypt from 'bcrypt';
import { User } from '../../model/user.js';
import { Admin } from '../../model/admin.js';
import { Hospital } from '../../model/hospital.js';
import { validationResult } from 'express-validator';
import { errorHandler } from '../../util/errorHandler.js';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function createAdmin(req, res, next) {
  const {
    role,
    email,
    lastname,
    username,
    password,
    firstname,
    phone_number,
    hospital_name,
  } = req.body;

  // performs checks for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }

  try {
    // check for an existing user
    const user = await User.findOne({ email: email });

    if (user) {
      errorHandler(302, 'email exists');
    }

    const hospitals = await Hospital.findOne({ name: hospital_name });

    if (!hospitals) {
      errorHandler(404, 'hospital does not exists');
    }

    const encrpyted_pass = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      lastname,
      firstname,
      role: role,
      phone_number,
      password: encrpyted_pass,
    });

    newUser.save();

    const newAdmin = new Admin({
      _id: newUser._id,
      hospital: hospitals._id,
      isAdmin: true,
    });

    newAdmin.save();

    // set the new admin
    hospitals.admin = newAdmin._id;

    hospitals.save();

    return res.status(202).json({
      message: 'Accepted',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
    return error;
  }
}

export default createAdmin;
