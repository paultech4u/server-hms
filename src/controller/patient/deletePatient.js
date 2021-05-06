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
async function deletePatient(req, res, next) {
  const patientId = req.body;

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
    const user = await User.findById(authId);

    if (!admin || !user) {
      errorHandler('401', 'unauthorized');
    }

    const specialization =
      user.specialization !== 'Doctor' || user.specialization !== 'Nurse';

    // is not an admin
    if (admin.isAdmin !== true || specialization) {
      errorHandler('401', 'unauthorized');
    }

    // delete patient
    const patient = await Patient.findByIdAndDelete(patientId);

    // patient does not exist
    if (!patient) {
      errorHandler('302', 'patient does not exit');
    }

    // save patient
    await patient.save();

    return res.status(200).json({
      message: 'patient record updated successful',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default deletePatient;
