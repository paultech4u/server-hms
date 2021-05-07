import bcrypt from 'bcrypt';
import { User } from '../../model/user.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './service.js';
import { errorHandler } from '../../util/errorHandler.js';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function loginUser(req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      errorHandler(404, `user does not exists`);
    }
    if (user.isVerified === false) {
      errorHandler(401, `user not verified`);
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      errorHandler(401, 'wrong password');
    }

    let new_reftoken = null;

    const payload = {
      id: user.id,
    };

    // check if user refresh token is valid
    const verifyRefToken = verifyRefreshToken(user.refToken);
    const accessToken = signAccessToken(user._id, payload);
    const verifyIdToken = verifyAccessToken(accessToken);

    if (verifyRefToken.error) {
      if (verifyRefToken.error.message === 'jwt expired' || !user.refToken) {
        new_reftoken = signRefreshToken(user._id, payload);
        user.refToken = new_reftoken;
        await user.save();
        return res.status(200).json({
          message: 'Ok',
          email: user.email,
          access_token: accessToken,
          username: user.username,
          expires_in: verifyIdToken.exp,
        });
      }
    }

    if (!user.refToken) {
      new_reftoken = signRefreshToken(user._id, payload);
      user.refToken = new_reftoken;
      await user.save();
      return res.status(200).json({
        message: 'Ok',
        email: user.email,
        access_token: accessToken,
        username: user.username,
        expires_in: verifyIdToken.exp,
      });
    }

    return res.status(200).json({
      message: 'Ok',
      email: user.email,
      access_token: accessToken,
      username: user.username,
      expires_in: verifyIdToken.exp,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default loginUser;
