import { User } from '../../model/user';
import { Response, Request } from 'express';
import { ErrorException } from '../../util/error';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next  next middleware function
 */
 const UserAccountDeactivation = async function (req, res, next) {
  const { userID } = req.body;
  try {
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, 'User not found');
    }
    user.isVerified = false;
    user.save();
    res.status(200).json({
      message: 'User disabled',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};


export default UserAccountDeactivation;

