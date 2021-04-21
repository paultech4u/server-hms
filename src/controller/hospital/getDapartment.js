import { errorHandler } from '../../util/errorHandler';
import { validationResult } from 'express-validator';
import { Department } from '../../model/department';

/**
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 *
 */

/**
 * Get a single department
 * @param  {Request} req object
 * @param  {Response} res object
 * @param  {NextFunction} next function
 */

async function getDepartment(req, res, next) {
  const { id } = req.query;
  const errors = validationResult(req);

   // handle express validation error
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  try {
    const department = await Department.findById(id);

    if (!department) {
      errorHandler(404, 'Department not found');
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
}

export default getDepartment;
