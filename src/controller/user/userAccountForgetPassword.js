import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import { Response, Request } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from './userAccountService';
import { ErrorException } from '../../util/error';
import { validationResult } from 'express-validator';

/**
 * @global
 * @author  Paulsimon Edache
 */

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
const UserForgetPassword = async function (req, res, next) {
  const { password, email } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      res.status(406).json({
        error: errors.mapped(),
      });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      ErrorException(404, `${email} not found`);
    }
    if (email !== user.email) {
      ErrorException(404, `${email} is not a registered on this application `);
    }
    if (user.isVerified == false) {
      ErrorException(404, `${email} your email is not verified`);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      ErrorException(
        406,
        'new password must not be the same with the old password'
      );
    }
    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    const [isSaved] = await Promise.all([user.save()]);
    if (isSaved) {
      const payload = {
        _id: user.id,
      };
      const accessToken = signAccessToken(user.id, payload);
      const refreshToken = signRefreshToken(user.id, payload);
      const verifyToken = verifyAccessToken(accessToken);
      res.status(200).json({
        message: 'OK',
        email: user.email,
        username: user.username,
        user_id: user._id,
        id_token: accessToken,
        expires_in: verifyToken.exp,
        refresh_token: refreshToken,
      });
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export default UserForgetPassword;
