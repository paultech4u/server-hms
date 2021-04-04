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
export const GetDepartments = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  const perPage = 5;
  const currentPage = 1;
  try {
    // TODO get all document in the department collection
    const departments = await Department.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .orFail(() => {
        // TODO throw error if department is not available
        ErrorExceptionMessage(404, 'No Departments found');
      })
      .populate(
        'hospital',
        'name email state creation address admin zip_code -_id'
      );
    // TODO number of available departments
    const totalDepartments = await Department.find().countDocuments();

    res.status(200).json({
      message: 'Fetched departments successful!',
      departments: departments,
      totalDepartments: totalDepartments,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
