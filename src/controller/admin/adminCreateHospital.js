import { Hospital } from '../../model/hospital';
import { ErrorException } from '../../util/error';
import { validationResult } from 'express-validator';

/**
 * @typedef {object} req
 * @typedef {object} res
*/

/**
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
const createHospital = async function (req, res, next) {
  const { hospital_name, hospital_email, state, address, zip_code } = req.body;

  // Express validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }
  try {
    const hospital = await Hospital.findOne({ name: hospital_name });
    if (hospital) {
      ErrorException(404, 'Hospital  exist');
    }
    const new_hospital = new Hospital({
      name: hospital_name,
      email: hospital_email,
      state,
      address,
      zip_code,
    });
    new_hospital.save();
    return res.status(201).json({
      message: 'Created',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export default createHospital;
