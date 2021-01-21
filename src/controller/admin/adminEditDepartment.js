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
export const EditDepartment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  } // TODO check if department exists
  // TODO send a res if department exist
  const { id } = req.params; // department id
  const { name, description } = req.body;

  const department = await Department.findById(id).updateOne(
    {},
    { name: name, department: description }
  );
  try {
    if (!department) {
      ErrorException(404, 'Department not found');
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
};
