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
async function editDepartment(req, res, next) {
  // department id
  const { id } = req.params;
  const { name, description } = req.body;
  const errors = validationResult(req);

  // perform checks for validation error
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }

  try {
    const department = await Department.findById(id).updateOne(
      {},
      { name: name, department: description }
    );

    if (!department) {
      ErrorExceptionMessage(404, 'Department not found');
    }

    res.status(200).json({
      message: `Department updated`,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default editDepartment;
