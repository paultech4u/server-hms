import { Hospital } from '../../model/hospital.js';
import { errorHandler } from '../../util/errorHandler.js';
import { validationResult } from 'express-validator';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function createHospital(req, res, next) {
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

    // hospital exist
    if (hospital) {
      errorHandler(404, 'Hospital  exist');
    }

    const newHospital = new Hospital({
      name,
      email,
      state,
      address,
      zip_no,
    });

    await newHospital.save();

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

export default createHospital;
