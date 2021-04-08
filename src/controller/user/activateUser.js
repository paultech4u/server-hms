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
async function activateUser(req, res, next) {
  const { Id } = req.params;
  try {
    const user = await User.findById(Id);

    if (!user) {
      ErrorExceptionMessage(404, 'User not found');
    }

    // check if user already verified
    if (user.isVerified === true) {
      ErrorExceptionMessage(422, 'Account already verified');
    }

    user.isVerified = true;

    user.save();

    res.status(200).json({
      message: 'OK',
    });
  } catch (error) {}
}

export default activateUser;
