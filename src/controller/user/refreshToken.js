import { User } from '../../model/user';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './userAccountService';

import { ErrorExceptionMessage } from '../../util/error';

/**
 *
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 */

/**
 * @param  {Request} req object
 * @param  {Response} res object
 * @param  {NextFunction} next  middleware function
 */
async function refreshToken(req, res, next) {
  // user uuid 
  const { userId } = req;

  try {

    if (!userId) {
      ErrorExceptionMessage(401, 'uuid unavailable');
    }

    const user = await User.findById(userId);

    // check if user has refresh token
    if (!user.refToken) {
      ErrorExceptionMessage(404, 'No token present');
    }

    let new_reftoken = null;

    const payload = {
      id: user.id,
    };

    const verifyRefToken = verifyRefreshToken(user.refToken);
    const accessToken = signAccessToken(userId, payload);
    const verifyIdToken = verifyAccessToken(accessToken);

    // condition for no refresh token
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
          access_token: verifyIdToken,
        });
      }
    } else {
      return res.status(200).json({
        message: 'Ok',
        expires_in: verifyIdToken.exp,
        access_token: accessToken,
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

export default refreshToken;
