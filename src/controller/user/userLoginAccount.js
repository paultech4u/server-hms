import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './userAccountService';

import { ErrorExceptionMessage } from '../../util/error';

/**
 * @typedef {object} request
 * @typedef {object} response
 *
 */

/**
 * @param  {request} req request object
 * @param  {response} res  response object
 * @param  {Function} next next middleware function
 * @author  Paulsimon Edache
 */
const UserLogin = async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      ErrorExceptionMessage(404, `${email} does not exists`);
    }
    if (user.isVerified === false) {
      ErrorExceptionMessage(401, `${email} not verified`);
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      ErrorExceptionMessage(401, 'wrong password');
    }

    let new_reftoken = null;

    const payload = {
      id: user.id,
    };

    const verifyRefToken = verifyRefreshToken(user.refToken);
    const accessToken = signAccessToken(user._id, payload);
    const verifyIdToken = verifyAccessToken(accessToken);

    if (!user.refToken) {
      new_reftoken = signRefreshToken(user._id, payload);
      user.refToken = new_reftoken;
      await user.save();
      return res.status(200).json({
        message: 'Ok',
        user_id: user._id,
        email: user.email,
        id_token: accessToken,
        refToken: new_reftoken,
        username: user.username,
        expires_in: verifyIdToken.exp,
      });
    }

    if (verifyRefToken.error) {
      if (verifyRefToken.error.message === 'jwt expired' || !user.refToken) {
        new_reftoken = signRefreshToken(user._id, payload);
        user.refToken = new_reftoken;
        await user.save();
        return res.status(200).json({
          message: 'Ok',
          user_id: user._id,
          email: user.email,
          id_token: accessToken,
          refToken: new_reftoken,
          username: user.username,
          expires_in: verifyIdToken.exp,
        });
      }
    }

    return res.status(200).json({
      message: 'Ok',
      user_id: user._id,
      email: user.email,
      id_token: accessToken,
      refToken: user.refToken,
      username: user.username,
      expires_in: verifyIdToken.exp,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export default UserLogin;
