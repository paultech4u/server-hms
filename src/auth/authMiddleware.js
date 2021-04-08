import jwt from 'jsonwebtoken';
import { ErrorExceptionMessage } from '../util/error';

const { JWT_SECRET_KEY } = process.env;


// check if user is authenticate
function isAuthenticated(req, res, next){
  const authheader = req.get('Authorization');
  if (!authheader) {
    ErrorExceptionMessage(511, 'Not authenticated');
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
    ErrorExceptionMessage(401, 'Token invalid');
  }
  req.userId = decodedToken.id;
  next();
};

export default isAuthenticated;
