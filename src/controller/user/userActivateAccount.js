import { User } from '../../model/user';
import { Response, Request } from 'express';
import { ErrorExceptionMessage } from '../../util/error';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
const UserAccountActivation = async function (req, res, next) {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      ErrorExceptionMessage(404, 'User not found');
    }
    if (user.isVerified === true) {
      ErrorExceptionMessage(422, 'Account already verified');
    }
    user.isVerified = true;
    user.save();
    res.status(200).json({
      message: 'OK',
    });
  } catch (error) {}
};

export default UserAccountActivation;
