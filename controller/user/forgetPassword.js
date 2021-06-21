import bcrypt from 'bcrypt';
import { User } from '../../model/user.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from './service.js';
import { errorHandler } from '../../util/errorHandler.js';
import { validationResult } from 'express-validator';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function forgetPassword(req, res, next) {
  // password1=new password
  // password2=confirm password
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
      errorHandler(404, 'email provided is not a registered email account');
    }

    // // user email is not registered
    // if (email !== user.email) {
    //   errorHandler(404, `user not registered`);
    // }

    // check if user is verified
    if (user.isVerified === false) {
      errorHandler(404, `user not verified`);
    }

    // compare password
    if (password1 !== password2) {
      errorHandler(406, 'password did not match');
    }

    const isMatch = await bcrypt.compare(password1, user.password);
    if (isMatch) {
      errorHandler(406, 'can not use previous password');
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
