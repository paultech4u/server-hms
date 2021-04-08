import { User } from '../../model/user';
import { Response, Request } from 'express';
import { ErrorExceptionMessage } from '../../util/error';

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
async function deactivateUser(req, res, next) {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      ErrorExceptionMessage(404, 'User not found');
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
