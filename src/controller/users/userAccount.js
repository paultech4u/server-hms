import { User } from '../../model/user';
import { Response, Request } from 'express';
import { ErrorException } from '../../util/error';
import { activationEmail } from './userService';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next  next middleware function
 */
export const UserAccountDeactivation = async function (req, res, next) {
  const { userID } = req.body;
  try {
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, 'User not found');
    }
    user.isActive = false;
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

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
export const UserAccountActivation = async function (req, res, next) {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      ErrorException(404, 'User not found');
    }
    if (user.isVerified === true) {
      ErrorException(422, 'Account already verified');
    }
    user.isVerified = true;
    user.save();
    activationEmail(user.email, req.host, user.name);
    res.status(200).json({
      message: 'OK',
    });
  } catch (error) {}
};
