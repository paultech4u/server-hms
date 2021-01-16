import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { Response, Request } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from './userService';
import { Hospital } from '../../model/hospital';
import { ErrorException } from '../../util/error';
import { validationResult } from 'express-validator';

/**
 * @global
 * @author  Paulsimon Edache
 */

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
export const UserGetProfile = async function (req, res, next) {
  // TODO get a user profile payload from an authorization token
  // TODO if user is authenticated.
  const { userID } = req;

  // TODO check if user exits
  try {
    const user = await User.findOne({ _id: userID })
      .select([
        'email',
        'role',
        'isAdmin ',
        'firstname',
        'lastname',
        'isActive',
        'username',
        'phone_number',
      ])
      .populate('hospital', 'name -_id')
      .populate('department', 'name -_id')
      .exec();
    if (!user) {
      ErrorException(404, 'User not found');
    }
    res.status(200).json({ message: 'OK', user: user });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = 'Unable to fetch profile';
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
export const UserDelete = async function (req, res, next) {
  const { userID } = req.query;
  const adminID = req.userID;

  try {
    const admin = await Admin.findOne({
      _id: adminID,
    });
    if (admin.isAdmin === false) {
      ErrorException(401, 'Unauthorized');
    }
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, 'User not found');
    }
    if (adminID === user._id) {
      ErrorException(403, 'Forbidden');
    }
    // Todo check hospital admins if user is an admin
    let isAdmin;
    const hospital = await Hospital.findOne({ name: admin.hospital });
    const checkAdmin = (id) => {
      return id === admin._id;
    };
    isAdmin = hospital.admin;
    if (checkAdmin(isAdmin)) {
      hospital.admin = null;
      hospital.save();
      user.remove();
      res.status(200).json({ message: 'OK' });
      return;
    }
    await user.remove();
    res.status(200).json({ message: 'OK' });
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
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const UserForgetPassword = async function (req, res, next) {
  const { newPassword, mobileNumber, email } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      res.status(406).json({
        error: errors.mapped(),
      });
    }
    const user = await User.findOne({ tel: mobileNumber }).or([
      { email: email },
    ]);
    if (!user) {
      ErrorException(404, 'User not found');
    }
    if (email !== user.email) {
      ErrorException(404, `${email} is not a registered email address`);
    }
    if (user.isVerified == false) {
      ErrorException(404, `${email} is not verified`);
    }
    const isMatch = await bcrypt.compare(newPass, user.password);
    if (isMatch) {
      ErrorException(
        406,
        'new password must not be the same with the old password'
      );
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    const [isSaved] = await Promise.all([user.save()]);
    if (isSaved) {
      const payload = {
        _id: user.id,
        isActive: false,
      };
      const accessToken = signAccessToken(user.id, payload);
      const refreshToken = signRefreshToken(user.id, payload);
      const verifyToken = verifyAccessToken(accessToken);
      res.status(200).json({
        message: 'OK',
        id_token: accessToken,
        expires_in: verifyToken.exp,
        refresh_token: refreshToken,
      });
    }
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
export const UserResetPassword = async function (req, res, next) {
  const { userID } = req;
  const { newPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  try {
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, 'User not found');
    }
    const isEqual = await bcrypt.compare(newPassword, user.password);
    if (isEqual) {
      ErrorException(
        406,
        'new password must not be the same with previous password'
      );
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.save();
    res.status(200).json({
      message: 'OK',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.massage = 'change cannot be applied';
      next(error);
    }
  }
};
