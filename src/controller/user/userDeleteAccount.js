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
  const { Id } = req.query;
  const { userId } = req;

  try {
    const admin = await Admin.findById(userId);

    if (!admin) {
      ErrorException(401, 'No admin found');
    }

    // @TODO check user is an admin
    const isHospitalAdmin = await Hospital.findOne({ admin: admin._id });

    // @TODO check if user as no authorize access.
    if (admin._id !== isHospitalAdmin.admin) {
      ErrorException(401, 'Unathorised access');
    }

    const user = await User.findById(Id);
    if (!user) {
      ErrorException(404, 'User not found');
    }

    // @TODO compare id if they are equal.
    if (userId === user._id) {
      ErrorException(406, 'Cannot remove admin');
    }
    const deleteUser = await User.deleteOne({ _id: Id });
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
