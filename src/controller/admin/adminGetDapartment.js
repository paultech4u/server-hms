import { ErrorExceptionMessage } from '../../util/error';
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
// TODO get a single department
export const GetDepartment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  const { id } = req.params;
  const department = await Department.findById(id);
  try {
    if (!department) {
      ErrorExceptionMessage(404, 'Department not found');
    }
    res.status(200).json({
      message: 'Fetched department successful!',
      department: department,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
