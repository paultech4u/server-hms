import { User } from '../../model/user';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './userAccountService';

import { ErrorException } from '../../util/error';

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
const RefreshToken = async function (req, res, next) {
  const { userId } = req;
  try {
    if (!userId) {
      ErrorException(401, 'No Id');
    }

    const user = await User.findById(userId);

    if (!user.refToken) {
      ErrorException(404, 'No token present');
    }

    let new_reftoken = null;

    const payload = {
      id: user.id,
    };

    const verifyRefToken = verifyRefreshToken(user.refToken);
    const accessToken = signAccessToken(userId, payload);
    const verifyIdToken = verifyAccessToken(accessToken);

    if (!verifyRefToken) {
      if (verifyRefToken.error.message === 'jwt expired') {
        new_reftoken = signRefreshToken(user._id, payload);
        const newUserReftoken = new User({
          refToken: new_reftoken,
        });
        await newUserReftoken.save();
        return res.status(200).json({
          message: 'Ok',
          expires_in: verifyIdToken.exp,
          refresh_token: newUserReftoken,
          id_token: verifyIdToken,
        });
      }
    } else {
      return res.status(200).json({
        message: 'Ok',
        expires_in: verifyIdToken.exp,
        refresh_token: user.refToken,
        id_token: accessToken,
      });
    }
  } catch (error) {
    if (!error.status) {
      console.log(error);
      error.status = 500;
    }
    next(error);
  }
};

export default RefreshToken;
