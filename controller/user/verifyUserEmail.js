import { User } from '../../model/user.js';
import { verifyAccessToken } from './service.js';
import { errorHandler } from '../../util/errorHandler.js';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
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
