import { User } from '../../model/user.js';
import { Checkup } from '../../model/checkup.js';
import { Patient } from '../../model/patient.js';
import { validationResult } from 'express-validator';
import { errorHandler } from '../../util/errorHandler.js';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function createPatientCheckup(req, res, next) {
  const { symptoms, diagnosis, prescription, description } = req.body;

  const { patientId } = req.query;

  const authId = req.userId;

  /** handle express validation error */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }

  try {
    const user = await User.findById(authId);

    const isDoctor = user.specialization === 'Doctor';

    // user not authorized
    if (isDoctor === false) {
      errorHandler(
        '401',
        'only doctors has authorized access to this service'
      );
    }

    const patient = await Patient.findById(patientId);

    // patient exist
    if (!patient) {
      errorHandler('302', 'patient does not exits');
    }

    const addNewCheckup = new Checkup({
      symptoms,
      diagnosis,
      prescription,
      description,
      psychiatristId: user._id,
    });

    addNewCheckup.save();

    return res.status(200).json({
      message: 'checkup added',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default createPatientCheckup;
