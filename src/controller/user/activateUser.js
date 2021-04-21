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
 * @param  {NextFunction} next middleware function
 */
async function activateUser(req, res, next) {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      errorHandler(404, 'User not found');
    }

    // check if user already verified
    if (user.isVerified === true) {
      errorHandler(422, 'Account already verified');
    }

    user.isVerified = true;

    user.save();

    res.status(200).json({
      message: 'OK',
    });
  } catch (error) {}
}

export default activateUser;
