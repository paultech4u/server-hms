import { User } from '../../model/user';
import { Response, Request } from 'express';
import { ErrorExceptionMessage } from '../../util/error';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
const getUserProfile = async function (req, res, next) {
  // TODO get a user profile payload from an authorization token
  // TODO if user is authenticated.
  const { userId } = req;

  // TODO check if user exits
  try {
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
      ErrorExceptionMessage(404, 'User not found');
    }
    res.status(200).json({ message: 'OK', user: user });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = 'Unable to fetch profile';
    }
    next(error);
  }
};

export default getUserProfile;
