import { ErrorExceptionMessage } from '../../util/error';
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
async function getDepartments(req, res, next) {
  const perPage = 5;
  const currentPage = 1;

  try {
    // get all document in the department collection
    const departments = await Department.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .orFail(() => {
        // throw error if department is not available
        ErrorExceptionMessage(404, 'No Departments found');
      })
      .populate(
        'hospital',
        'name email state creation address admin zip_code -_id'
      );

    // number of available departments
    const totalDepartments = await Department.find().countDocuments();

    res.status(200).json({
      message: 'Fetched departments successful!',
      departments: departments,
      total_departments: totalDepartments,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default getDepartments;
