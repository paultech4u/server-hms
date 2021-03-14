import jwt from 'jsonwebtoken';
import { ErrorExceptionMessage } from '../../util/error';

const { JWT_SECRET_KEY, JWT_REFRESH_SECRET_KEY } = process.env;

/**
 *
 * @returns {string} string
 * @typedef {object} ObjectLike
 * @param {string} userId userId
 * @param {ObjectLike} payload user info
 */
export const signAccessToken = (userId, payload) => {
  try {
    const accessToken = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: '1d',
      audience: userId.toString(),
    });
    return accessToken;
  } catch (err) {
    ErrorExceptionMessage(422, 'Unprocessable entity');
  }
};

/**
 *
 * @returns {(string|object)} string | object
 * @param {(string)} token Id_Token
 */
export const verifyAccessToken = (token) => {
  try {
    const accessToken = jwt.verify(token, JWT_SECRET_KEY);
    return accessToken;
  } catch (error) {
    ErrorExceptionMessage(406, 'Token expired');
  }
};

/**
 * Returns a new sign Refresh_Token
 * which is used to generate in generating a new ID_Token
 * @returns {string} string
 * @typedef {object} ObjectLike
 * @param {ObjectLike} payload user info
 * @param {(string|number)} userId user id
 */
export const signRefreshToken = (userId, payload) => {
  try {
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET_KEY, {
      expiresIn: '7d',
      audience: userId.toString(),
    });
    return refreshToken;
  } catch (error) {
    ErrorExceptionMessage(422, 'Unprocessable entity');
  }
};

/**
 *
 * @returns {(string|object)} string | object
 * @param {string} refreshToken a new refresh token
 */

export const verifyRefreshToken = (refreshToken) => {
  try {
    const decodedToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
    return decodedToken.aud;
  } catch (error) {
    return error;
  }
};
