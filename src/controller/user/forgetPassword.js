import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import { Response, Request } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from './service';
import { ErrorExceptionMessage } from '../../util/error';
import { validationResult } from 'express-validator';

/**
 *
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 */

/**
 * @param  {object} req   object
 * @param  {object} res   object
 * @param  {NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function forgetPassword(req, res, next) {
  const { password1, password2, email } = req.body;
  const errors = validationResult(req);

   // handle express validation error
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      ErrorExceptionMessage(404, `${email} not found`);
    }

    if (email !== user.email) {
      ErrorExceptionMessage(
        404,
        `${email} is not a registered on this application `
      );
    }

    // check if user is verified
    if (user.isVerified === false) {
      ErrorExceptionMessage(404, `${email} your email is not verified`);
    }

    // compare password
    if (password1 !== password2) {
      ErrorExceptionMessage(406, 'password not match');
    }

    const isMatch = await bcrypt.compare(password1, user.password);
    if (isMatch) {
      ErrorExceptionMessage(
        406,
        'new password must not be the same with the old password'
      );
    }

    const payload = {
      id: user.id,
    };

    const encrpyted_password = await bcrypt.hash(password1, 10);
    const accessToken = signAccessToken(user.id, payload);
    const verifyIdToken = verifyAccessToken(accessToken);
    const refreshToken = signRefreshToken(user.id, payload);

    // updating the encrpyted password and the refresh token model field
    user.password = encrpyted_password;
    user.refToken = refreshToken;

    // model saved
    user.save();

    // returned payload
    res.status(200).json({
      message: 'OK',
      email: user.email,
      user_id: user._id,
      username: user.username,
      access_token: accessToken,
      expires_in: verifyIdToken.exp,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default forgetPassword;
