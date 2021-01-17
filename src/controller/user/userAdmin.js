import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { ErrorException } from '../../util/error';
import { Hospital } from '../../model/hospital';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 * @returns {Promise} Promise
 */
export const MakeUserAdmin = async function (req, res, next) {
  // Todo Assign an admin privilege to a user
  const { user_id } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user) {
      ErrorException(404, 'User not found');
    }
    if (user) {
      if (user.isAdmin === true && user.isVerified !== true) {
        //  Todo check if user already have an admin privilege
        ErrorException(302, 'User email is not verified');
      }
    }
    const admin = await Admin.findById(user_id);
    if (admin) {
      ErrorException(302, 'User already an admin');
    }
    const hosp_id = await Hospital.findById(user.hospital);
    if (!hosp_id) {
      ErrorException(404, 'Hospital does not exist');
      return;
    }
    // Todo attach user payload to admin model
    const newAdmin = new Admin({
      _id: user._id,
      hospital: hosp_id._id,
      status: true,
      isAdmin: true,
    });
    user.isAdmin = true;
    const [a, u] = await Promise.all([newAdmin.save(), user.save()]);
    if (!a && !u) {
      res.status(200).json({
        message: 'Successful',
      });
      return;
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
