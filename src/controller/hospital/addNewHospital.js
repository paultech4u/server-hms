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
 * @param  {Response} res object
 * @param  {NextFunction} next fucntion
 */
async function addNewHospital(req, res, next) {
  const { name, email, state, address, zip_no } = req.body;

  // handle express validation error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      ...errors.mapped(),
    });
  }
  try {
    const hospital = await Hospital.findOne({ name: name });
    if (hospital) {
      ErrorExceptionMessage(404, 'Hospital  exist');
    }
    const new_hospital = new Hospital({
      name,
      email,
      state,
      address,
      zip_no,
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
}

export default addNewHospital;
