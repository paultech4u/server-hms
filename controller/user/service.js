import jwt from 'jsonwebtoken';
import { errorHandler } from '../../util/errorHandler.js';

const { JWT_SECRET_KEY, JWT_REFRESH_SECRET_KEY } = process.env;

/**
 *
 * 
 * @typedef {{}} ObjectLike
 * @typedef {{}} string
 */

/** 
 * @param {string} userId string
 * @param {ObjectLike} payload object
 * @returns {string}
 */
export const signAccessToken = (userId, payload) => {
  try {
    const accessToken = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: '1d',
      audience: userId.toString(),
    });
    return accessToken;
  } catch (err) {
    errorHandler(422, 'Unprocessable entity');
  }
};

/**
 * 
 * @typedef {{}} token
 */

/**
 * @param {(string)} token access_token
 * @returns {(string|object)} string | object
 */
export const verifyAccessToken = (token) => {
  try {
    const accessToken = jwt.verify(token, JWT_SECRET_KEY);
    return accessToken;
  } catch (error) {
    errorHandler(406, 'Token expired');
  }
};


/**
 * 
 * @typedef {{}} ObjectLike
 * @typedef {{}} userId
 */

/**
 * Returns a new sign refresh_token,
 * will sign a new refresh_token when expired
 * @returns {string} string
 * @param {ObjectLike} payload 
 * @param {(string|number)} userId 
 */
export const signRefreshToken = (userId, payload) => {
  try {
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET_KEY, {
      expiresIn: '7d',
      audience: userId.toString(),
    });
    return refreshToken;
  } catch (error) {
    errorHandler(422, 'Unprocessable entity');
  }
};

/**
 *
 * @returns {(string|object)} string | object
 * @typedef {{}} refresh_token
 * @param {string} refreshToken
 */

export const verifyRefreshToken = (refreshToken) => {
  try {
    const decodedToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
    return decodedToken.aud;
  } catch (error) {
    return error;
  }
};
