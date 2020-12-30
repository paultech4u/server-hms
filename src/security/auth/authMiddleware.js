import jwt from 'jsonwebtoken';
import { error } from '../../util/error';

// TODO check if user is authenticated
const { JWT_SECRET_KEY } = process.env;
export const isAuth = (req, res, next) => {
  const authheader = req.get('Authorization');
  if (!authheader) {
    error(511, 'Not authenticated');
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
    error(401, 'Token invalid');
  }
  req.userID = decodedToken._id;
  next();
};
