import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { Patient } from '../../model/patient';
import { errorHandler } from '../../util/errorHandler';

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
    patientId,
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
    const { isAdmin } = await Admin.findById(authId);
    const { specialization } = await User.findById(authId);

    const user = specialization !== 'Doctor' || specialization !== 'Nurse';

    // is not an admin
    if (isAdmin !== true || user) {
      errorHandler('401', 'unauthorized');
    }

    const patient = await Patient.findById(patientId);

    // patient exist
    if (patient) {
      errorHandler('302', 'patient exits');
    }

    // create new patient
    const newPatient = new Patient({
      _id: patientId,
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
