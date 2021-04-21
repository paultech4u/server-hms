import jwt from 'jsonwebtoken';
import { errorHandler } from '../util/errorHandler';

const { JWT_SECRET_KEY } = process.env;

/**
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 *
 */

/**
 
 * @param  {Request} req object
 * @param  {Response} res object
 * @param  {NextFunction} next function
 */
// check if user is authenticate
function isAuthenticated(req, res, next) {
  const authheader = req.get('Authorization');

  if (!authheader) {
    errorHandler(511, 'Not authenticated');
  }

  const token = authheader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, JWT_SECRET_KEY);
  } catch (error) {
    error.status = 500;
    throw error;
  }

  if (!decodedToken) {
    errorHandler(401, 'Token invalid');
  }

  req.userId = decodedToken.id;
  next();
}

export default isAuthenticated;
