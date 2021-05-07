import jwt from 'jsonwebtoken';
import { errorHandler } from '../util/errorHandler.js';

const { JWT_SECRET_KEY } = process.env;

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
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
