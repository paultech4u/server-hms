import { User } from '../../model/user.js';
import { errorHandler } from '../../util/errorHandler.js';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function deactivateUser(req, res, next) {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      errorHandler(404, 'User not found');
    }

    // unverify the user
    user.isVerified = false;

    user.save();

    res.status(200).json({
      message: 'User disabled',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default deactivateUser;
