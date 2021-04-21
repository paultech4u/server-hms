import { User } from '../../model/user';
import { Response, Request } from 'express';
import { verifyAccessToken } from './service';
import { errorHandler } from '../../util/errorHandler';

/**
 *
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 */

/**
 * @param  {Request} req object
 * @param  {Response} res object
 * @param  {NextFunction} next  middleware function
 */
async function verifyUserEmail(req, res, next) {
  // @TODO verify a new user account
  // Get access-token from the request query string.
  const { token } = req.query;

  if (!token) {
    errorHandler(404, 'access_token not found');
  }

  let decodedToken;

  try {
    // verify id token.
    decodedToken = verifyAccessToken(token);
    if (!decodedToken) {
      errorHandler(401, 'Invalid token');
    }

    const { _id } = decodedToken;
    const user = await User.findById({ _id: _id });

    // throw error if no user
    if (!user) {
      errorHandler(404, 'User not found');
    }

    // verify the user
    user.isVerified = true;

    // update the user
    const newUser = user.save();
   
    res.status(200).json({
      message: 'Email verified',
      payload: newUser,
    });
    
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
    return error;
  }
}

export default verifyUserEmail;
