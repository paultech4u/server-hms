import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { Response, Request } from 'express';
import { Hospital } from '../../model/hospital';
import { ErrorException } from '../../util/error';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req request object
 * @param  {object} res response object
 * @param  {Function} next next middleware function
 */
const UserDelete = async function (req, res, next) {
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

export default UserDelete;
