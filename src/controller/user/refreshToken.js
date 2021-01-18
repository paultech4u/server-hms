import { User } from '../../model/user';
import { Response, Request } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from './userAccountService';

import { ErrorException } from '../../util/error';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
const RefreshToken = async function (req, res, next) {
  const { userID } = req;
  try {
    if (!userID) {
      ErrorException(401, 'No user id found');
    }

    const user = await User.findById(userID);

    const payload = {
      _id: user.id,
      isActive: true,
    };
    const accessToken = signAccessToken(userID, payload);
    const refreshToken = signRefreshToken(userID, payload);
    const verifyToken = verifyAccessToken(accessToken);
    res.status(200).json({
      message: 'Ok',
      expires_in: verifyToken.exp,
      refresh_token: refreshToken,
      id_token: accessToken,
    });
  } catch (error) {
    if (!error.status) {
      console.log(error);
      error.status = 500;
    }
    next(error);
  }
};

export default RefreshToken;
