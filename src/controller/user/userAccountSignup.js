import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../model/user';
import { Hospital } from '../../model/hospital';
import { ErrorExceptionMessage } from '../../util/error';
import { Department } from '../../model/department';
import { validationResult } from 'express-validator';
import { comfirmationMSG } from '../../service/sendgrid';

const { JWT_SECRET_KEY } = process.env;

/**
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 * 
 */

/**
 
 * @param  {Request} req object
 * @param  {Response} res object
 * @param  {NextFunction} next function
 */
async function addNewUser(req, res, next) {
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
    department_name,
  } = req.body;

  const { userId } = req;

  // Performs checks for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }

  try {
    // @TODO check if user making this request is an admin
    const isUserAdmin = await User.findById(userId);
    if (!isUserAdmin) {
      ErrorExceptionMessage(404, 'Admin not found');
    }

    if (isUserAdmin.role !== 'ADMIN') {
      ErrorExceptionMessage(401, 'Unauthorised access');
    }

    // @TODO Check if user exist
    const user = await User.findOne({ email: email });
    if (user) {
      ErrorExceptionMessage(302, 'Email exists');
    }

    const hospital = await Hospital.findOne({ name: hospital_name });

    if (!hospital) {
      ErrorExceptionMessage(404, 'Hospital does not exists');
    }

    // Query for an existing department
    const departments = await Department.findOne({ name: department_name });
    if (!departments) {
      ErrorExceptionMessage(404, 'Departments does not exists');
    }

    // Encrpyt user password
    const encrpyt_pass = await bcrypt.hash(password, 10);

    const new_user = new User({
      email,
      firstname,
      lastname,
      username,
      password: encrpyt_pass,
      phone_number,
      role: role,
      hospital: hospital._id,
      department: departments._id,
    });
    await new_user.save();
    const accessToken = jwt.sign(
      {
        id: new_user._id,
      },
      JWT_SECRET_KEY,
      { expiresIn: '10m' }
    );
    // @TODO Send a comfirmation message to newly created account
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
};

export default addNewUser;
