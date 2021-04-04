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
export const DeleteDepartment = async (req, res, next) => {
  const { id } = req.params;
  const department = await Department.findByIdAndDelete(id);
  try {
    if (!department) {
      res.status(404).json({
        message: 'DEPARTMENT_NOT_FOUND',
      });
    }
    res.status(200).json({
      message: 'Deleted',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
