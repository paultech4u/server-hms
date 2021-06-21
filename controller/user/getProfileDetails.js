import { User } from '../../model/user.js';
import { errorHandler } from '../../util/errorHandler.js';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
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
        'username',
        'isVerified',
        'phone_number',
        'specialization',
      ])
      .populate('hospital', 'name -_id')
      .exec();

    if (!user) {
      errorHandler(404, 'unable to retrieve profile');
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
