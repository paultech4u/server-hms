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
async function refreshToken(req, res, next) {
  // user uuid
  const { userId } = req;

  try {
    if (!userId) {
      errorHandler(401, 'no id found');
    }

    const user = await User.findById(userId);

    // check if user has refresh token
    if (!user.refToken) {
      errorHandler(404, 'no token found');
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
}

export default refreshToken;
