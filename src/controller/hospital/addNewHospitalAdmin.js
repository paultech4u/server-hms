import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { Hospital } from '../../model/hospital';
import { ErrorExceptionMessage } from '../../util/error';
import { validationResult } from 'express-validator';

/**
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 */

/**
 * @param  {Request} req object
 * @param  {Response} res   object
 * @param  {NextFunction} next function
 */
async function addNewHospitalAdmin(req, res, next) {
  const {
    email,
    lastname,
    username,
    password,
    firstname,
    phone_number,
    hospital_name,
  } = req.body;

  const { role } = req.query;

  // Performs checks for validation errors
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

    // check for an existing user
    const user = await User.findOne({ email: email });
    if (user) {
      ErrorExceptionMessage(302, 'Email exists');
    }

    const hospitals = await Hospital.findOne({ name: hospital_name });

    if (!hospitals) {
      ErrorExceptionMessage(404, 'Hospital does not exists');
    }

    const encrpyt_pass = await bcrypt.hash(password, 10);

    // preform checks for valid admin role type
    if (role !== admin_role_types.find((values) => values === role)) {
      ErrorExceptionMessage(400, 'Role provided cannot be an admin');
    }
    new_user = new User({
      email,
      firstname,
      lastname,
      username,
      password: encrpyt_pass,
      phone_number,
      role: role,
      isAdmin: true,
    });
    new_user.save();
    new_admin = new Admin({
      _id: new_user._id,
      hospital: hospitals._id,
    });
    new_admin.save();
    hospitals.admin = new_admin._id;
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

export default addNewHospitalAdmin;
