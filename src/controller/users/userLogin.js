import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import { Response, Request } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from './userService';

import { ErrorException } from '../../util/error';

/**
 * @global
 * @author  Paulsimon Edache
 */

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
export const UserLogin = async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      ErrorException(404, 'Email does not found');
    }
    if (user.isVerified === false) {
      ErrorException(401, 'Email not verified');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      ErrorException(401, 'Wrong password');
    }
    const payload = {
      _id: user.id,
      isActive: true,
    };
    const accessToken = signAccessToken(user._id, payload);
    const refreshToken = signRefreshToken(user._id, payload);
    const verifyToken = verifyAccessToken(accessToken);
    user.isActive = true;
    user.save();
    res.status(200).json({
      message: 'Ok',
      email: user.email,
      username: user.username,
      id: user._id,
      id_token: accessToken,
      expires_in: verifyToken.exp,
      refresh_token: refreshToken,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const UserLogout = async function (req, res, next) {
    const { userID } = req;
    try {
      const user = await User.findById(userID);
      if (!user) {
        ErrorException(404, 'User not found');
      }
      user.isActive = false;
      user.save();
      res.status(200).json({
        message: 'OK',
      });
    } catch (error) {
      if (!error.status) {
        error.status = 500;
      }
      next(error);
    }
  };
