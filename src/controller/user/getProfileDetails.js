import { User } from '../../model/user';
import { Response, Request } from 'express';
import { errorHandler } from '../../util/errorHandler';

/**
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 *
 */

/**
 
 * @param  {Request} req object
 * @param  {Response} res object
 * @param  {NextFunction} next function
 */
async function getUserProfileDetails(req, res, next) {
  // user uuid
  const { userId } = req;

  try {
    // query if user exits
    const user = await User.findOne({ _id: userId })
      .select([
        'email',
        'role',
        'isAdmin ',
        'firstname',
        'lastname',
        'isActive',
        'username',
        'phone_number',
      ])
      .populate('hospital', 'name -_id')
      .populate('department', 'name -_id')
      .exec();

    if (!user) {
      errorHandler(404, 'Unable to retrieve profile');
    }

    res.status(200).json({ message: 'OK', profile: user });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default getUserProfileDetails;
