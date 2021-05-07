import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../model/user.js';
import { Admin } from "../../model/admin.js"
import { Hospital } from '../../model/hospital.js';
import { errorHandler } from '../../util/errorHandler.js';
import { validationResult } from 'express-validator';
import { comfirmationMSG } from '../../service/sendgrid.js';

const { JWT_SECRET_KEY } = process.env;

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function createUser(req, res, next) {
  // request body
  const {
    role,
    email,
    lastname,
    username,
    password,
    firstname,
    phone_number,
    hospital_name,
    specialization,
  } = req.body;

  const { userId } = req;

  // handle express validation error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }

  try {
    // @TODO check if user making this request is an admin
    const { isAdmin } = await Admin.findById(userId);
    if (isAdmin === false) {
      errorHandler(404, 'Unauthorised access');
    }

    // @TODO check if user exist
    const user = await User.findOne({ email: email });
    if (user) {
      errorHandler(302, 'Email exists');
    }

    const hospital = await Hospital.findOne({ name: hospital_name });

    if (!hospital) {
      errorHandler(404, 'Hospital does not exists');
    }

    // Encrpyt user password
    const encrpyted_password = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      lastname,
      username,
      firstname,
      role: role,
      phone_number,
      specialization,
      hospital: hospital._id,
      password: encrpyted_password,
    });
    await newUser.save();
    const accessToken = jwt.sign(
      {
        id: newUser._id,
      },
      JWT_SECRET_KEY,
      { expiresIn: '10m' }
    );
    // send a comfirmation message to newly created account
    comfirmationMSG(email, req.hostname, accessToken, firstname);
    return res.status(200).json({
      message: 'Confirmation message sent',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default createUser;
