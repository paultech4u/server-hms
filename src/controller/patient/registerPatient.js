import { Admin } from '../../model/admin';
import { Patient } from '../../model/patient';
import { errorHandler } from '../../util/errorHandler';

/**
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 *
 */

/**
 
 * @param  {Request} req object
 * @param  {Response} res object
 * @param  {NextFunction} next middleware function
 */
async function registerPatient(req, res, next) {
  const admin_id = req.userId;
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
    patient_id,
    phoneNumber,
  } = req.body;

  /** handle express validation error */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }

  try {
    const isAdmin = await Admin.findById(admin_id);

    // is not an admin
    if (!isAdmin) {
      errorHandler('401', 'Unauthorized');
    }

    const patient = await Patient.findById(patient_id);

    // patient exist
    if (patient) {
      errorHandler('302', 'Patient is already registered');
    }

    // create new patient
    const newPatient = new Patient({
      _id: patient_id,
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
      message: 'Patient addedd successfully',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default registerPatient;
