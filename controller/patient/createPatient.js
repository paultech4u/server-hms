import { User } from '../../model/user.js';
import { Admin } from '../../model/admin.js';
import { Patient } from '../../model/patient.js';
import { validationResult } from 'express-validator';
import { errorHandler } from '../../util/errorHandler.js';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function createPatient(req, res, next) {
  const {
    dob,
    email,
    status,
    gender,
    address,
    lastname,
    firstname,
    middlename,
    bloodGroup,
    phoneNumber,
  } = req.body;

  const authId = req.userId;

  /** handle express validation error */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }

  try {
    const admin = await Admin.findById(authId);
    const { specialization } = await User.findById(authId);

    const isDoctor = specialization === 'Doctor';
    const isNurse = specialization === 'Nurse';

    // user not authorized
    if (admin & (isDoctor === false) & (isNurse === false)) {
      errorHandler('401', 'unauthorized');
    }

    const patient = await Patient.findOne({ email: email });

    const totalPatient = await Patient.estimatedDocumentCount(
      {},
      (err, count) => {
        if (err) {
          console.log(err);
        }
        return count;
      }
    );

    // patient exist
    if (patient) {
      errorHandler('302', 'patient exits');
    }

    // create new patient
    const newPatient = new Patient({
      _id: `PT_${totalPatient + 1}`,
      dob,
      email,
      gender,
      status,
      address,
      lastname,
      firstname,
      middlename,
      bloodGroup,
      phoneNumber,
    });

    // save patient
    await newPatient.save();

    return res.status(200).json({
      message: 'patient is successfully created',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default createPatient;
