import { Admin } from '../../model/admin';
import { Hospital } from '../../model/hospital';
import { ErrorExceptionMessage } from '../../util/error';
import { validationResult } from 'express-validator';
import { Department } from '../../model/department';

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
async function createDepartment(req, res, next) {
  const { department_name, description, hospital_name } = req.body;
  const { id } = req.query;

  const errors = validationResult(req);

  // handle express validation error
  if (!errors.isEmpty()) {
    res.status(412).json({
      message: errors.mapped(),
    });
  }

  try {
    const admin = await Admin.findById(id);

    // extract admin id from hospital
    const hospital = await Hospital.findOne({ name: hospital_name });

    if (!hospital) {
      ErrorExceptionMessage(404, 'Hospital not found');
    }

    if (hospital.admin !== id || admin.isAdmin !== true) {
      ErrorExceptionMessage(401, 'Unauthorized');
    }

    const department = await Department.findOne({
      name: department_name,
    });

    // check for any existing department
    if (department) {
      ErrorExceptionMessage(302, 'Department exists');
    }

    const newDepartment = new Department({
      name: department_name,
      description: description,
      creator: hospital.admin,
      hospital: hospital._id,
    });

    // save to database
    newDepartment.save();

    res.status(201).json({
      message: 'Created!',
      dapartment: newDepartment,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default createDepartment;
