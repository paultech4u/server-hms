import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { Hospital } from '../../model/hospital';
import { ErrorException } from '../../util/error';

/**
 * @typedef {object} request
 * @typedef {object} response
 *
 */

/**
 * @param  {request} req request object
 * @param  {response} res  response object
 * @param  {Function} next next middleware function
 * @author  Paulsimon Edache
 */
const UserDelete = async function (req, res, next) {
  const { userId } = req.query;
  const adminId = req.userId;

  try {
    const admin = await Admin.findOne({
      _id: adminId,
    });

    if (!admin) {
      ErrorException(401, 'No admin found');
    }
    // @TODO check user is an admin
    const hospital = await Hospital.findOne({ name: admin.hospital });

    if (admin._id !== hospital.admin) {
      ErrorException(401, 'Unathorised access');
    }

    const user = await User.findById(userId);
    if (!user) {
      ErrorException(404, 'User not found');
    }

    if (adminId === user._id) {
      ErrorException(406, 'Cannot remove admin');
    }
    const deleteUser = await User.deleteOne({ _id: userId });
    deleteUser.save();
    return res.status(200).json({ message: 'Successful' });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export default UserDelete;
