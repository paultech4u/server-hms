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
async function deleteDepartment(req, res, next) {
  const { id } = req.query;
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
}

export default deleteDepartment;
