import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from './userAccountService';

import { ErrorException } from '../../util/error';

/**
 * @global
 * @author  Paulsimon Edache
 */
/**
 * @typedef {object} req
 * @typedef {object} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
const UserLogin = async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      ErrorException(404, `${email} does not exists`);
    }
    if (user.isVerified === false) {
      ErrorException(401, `${email} not verified`);
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      ErrorException(401, 'Wrong password');
    }
    const payload = {
      _id: user.id,
    };
    const accessToken = signAccessToken(user._id, payload);
    const refreshToken = signRefreshToken(user._id, payload);
    const verifyToken = verifyAccessToken(accessToken);
    user.save();
    res.status(200).json({
      message: 'Ok',
      email: user.email,
      username: user.username,
      user_id: user._id,
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

export default UserLogin;
