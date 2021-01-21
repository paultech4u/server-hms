import { Admin } from '../../model/admin';
import { Hospital } from '../../model/hospital';
import { ErrorException } from '../../util/error';
import { validationResult } from 'express-validator';
import { Department } from '../../model/department';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 */

/**
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const CreateDepartment = async function (req, res, next) {
  const { name, description, hospital } = req.body;
  // Get admin id from auth token
  const { id } = req.query;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(412).json({
      message: errors.mapped(),
    });
  }
  try {
    const admin = await Admin.findById(id);
    // TODO extract admin id from hospital
    const hospitals = await Hospital.findOne({ name: hospital });
    if (!hospitals) {
      ErrorException(404, 'Hospital not found');
    }
    if (hospitals.admin !== id) {
      if (admin.isAdmin !== true) ErrorException(401, 'Unauthorized');
    }
    const department = await Department.findOne({
      name: name,
    });
    // TODO check for an exiting department
    if (department) {
      ErrorException(302, 'Department exists');
    }
    const newDepartment = new Department({
      name: name,
      description: description,
      creator: hospitals.admin,
      hospital: hospitals._id,
    });
    // TODO save to database
    newDepartment.save();
    res.status(201).json({
      message: 'Created!',
      newDepartment: newDepartment,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};








