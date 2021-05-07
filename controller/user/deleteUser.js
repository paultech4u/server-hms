import { User } from '../../model/user.js';
import { Admin } from '../../model/admin.js';
import { Hospital } from '../../model/hospital.js';
import { errorHandler } from '../../util/errorHandler.js';

/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function deleteUser(req, res, next) {
  const { Id } = req.params;

  const { userId } = req;

  try {
    const admin = await Admin.findById(userId);

    if (!admin) {
      errorHandler(401, 'no admin found');
    }

    // check user is an admin
    const isAdmin = await Hospital.findOne({ admin: admin._id });

    // check if user as no authorize access.
    if (admin._id !== isAdmin.admin) {
      errorHandler(401, 'unathorised access');
    }

    const user = await User.findById(Id);

    if (!user) {
      errorHandler(404, 'user not found');
    }

    // compare id if they are equal.
    if (userId === user._id) {
      errorHandler(406, 'admin can not be removed');
    }

    const deleteUser = await User.deleteOne({ _id: Id });

    deleteUser.save();

    return res.status(200).json({ message: 'successful' });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export default deleteUser;
