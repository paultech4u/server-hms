import { User } from '../../model/user';
import { Response, Request } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './userService';

import { ErrorException } from '../../util/error';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const RefreshToken = async function (req, res, next) {
  const { token } = req.query;
  try {
    if (!token) {
      ErrorException(401, 'No refresh token');
    }
    const userID = verifyRefreshToken(token);
    const user = await User.findById(userID);
    if (user.isActive !== true && user.isVerified !== true) {
      res.status(401, 'User not authenticated');
    }
    const payload = {
      _id: user.id,
      isActive: true,
    };
    const accessToken = signAccessToken(userID, payload);
    const refreshToken = signRefreshToken(userID, payload);
    const verifyToken = verifyAccessToken(accessToken);
    res.status(200).json({
      message: 'OK',
      expiresIn: verifyToken.exp,
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
  } catch (error) {
    if (!error.status) {
      console.log(error);
      error.status = 500;
    }
    next(error);
  }
};
