import jwt from 'jsonwebtoken';
import { ErrorException } from '../../util/error';

const { JWT_SECRET_KEY, JWT_REFRESH_SECRET_KEY } = process.env;

/**
 *
 * @typedef {Object} payload
 * @param {string} userId user unique identities
 * @param {object} payload user info
 * @returns {string} token
 */

export const signAccessToken = (userId, payload) => {
  try {
    const accessToken = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: '1d',
      audience: userId.toString(),
    });
    return accessToken;
  } catch (err) {
    ErrorException(422, 'Unprocessable entity');
  }
};

/**
 *
 * @param {string} token an ID_Token
 * @return {string} token
 */
export const verifyAccessToken = (token) => {
  try {
    const accessToken = jwt.verify(token, JWT_SECRET_KEY);
    return accessToken;
  } catch (error) {
    ErrorException(406, 'Token expired');
  }
};

/**
 * Returns a new sign Refresh_Token
 * which is used to generate in generating a new ID_Token
 * @typedef {Object} payload
 * @param {string|number} userId user unique identities
 * @param {object} payload user info
 * @returns {String} Refresh_Token
 */

export const signRefreshToken = (userId, payload) => {
  try {
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET_KEY, {
      expiresIn: '7d',
      audience: userId.toString(),
    });
    return refreshToken;
  } catch (error) {
    ErrorException(422, 'Unprocessable entity');
  }
};

/**
 *
 * @param {string} refreshToken a new refresh token
 * @returns {string} user unique identities
 */

export const verifyRefreshToken = (refreshToken) => {
  try {
    const decodedToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
    const userID = decodedToken.aud;
    return userID;
  } catch (error) {
    ErrorException(422, 'Unprocessable entity');
  }
};
