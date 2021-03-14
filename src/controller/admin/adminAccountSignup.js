import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { Hospital } from '../../model/hospital';
import { ErrorExceptionMessage } from '../../util/error';
import { validationResult } from 'express-validator';

/**
 * @typedef {object} req
 * @typedef {object} res
 */

/**
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
const adminAccountSignup = async function (req, res, next) {
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
      ErrorExceptionMessage(302, 'Email exists');
    }

    const hospitals = await Hospital.findOne({ name: hospital_name });

    if (!hospitals) {
      ErrorExceptionMessage(404, 'Hospital does not exists');
    }

    const hashed_password = await bcrypt.hash(password, 10);

    // Query for admin role type if it has admin role type.
    if (role !== admin_role_types.find((values) => values === role)) {
      ErrorExceptionMessage(400, 'Role provided cannot be an admin');
    }
    new_user = new User({
      email,
      firstname,
      lastname,
      username,
      password: hashed_password,
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
};

export default adminAccountSignup;
