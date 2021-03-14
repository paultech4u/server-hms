import { User } from '../../model/user';
import { Response, Request } from 'express';
import { verifyAccessToken } from './userAccountService';
import { ErrorExceptionMessage } from '../../util/error';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
const UserEmailVerification = async function (req, res, next) {
  // TODO verify a new user account
  // TODO get id token from the http query string.
  const { token } = req.query;
  if (!token) {
    ErrorExceptionMessage(404, 'ID_Token not found');
  }
  let decodedToken;
  try {
    // TODO verify id token.
    decodedToken = verifyAccessToken(token);
    if (!decodedToken) {
      ErrorExceptionMessage(401, 'Invalid token');
    }
    const { _id } = decodedToken;
    const user = await User.findById({ _id: _id });
    if (!user) {
      ErrorExceptionMessage(404, 'User not found');
    }
    user.isVerified = true;
    const [newUser] = await Promise.all([user.save()]);
    if (!newUser) {
      ErrorExceptionMessage(401, 'Email not verified');
    }
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
};

export default UserEmailVerification;
