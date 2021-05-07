import bcrypt from 'bcrypt';
import { User } from '../../model/user.js';
import { errorHandler } from '../../util/errorHandler.js';
import { validationResult } from 'express-validator';


/**
 * @param  {import("express").Response} req   object
 * @param  {import("express").Request} res   object
 * @param  {import("express").NextFunction} next middleware function
 * @author  Paulsimon Edache
 */
async function resetUserPassword(req, res, next) {
  const { userId } = req;
  const { newPassword } = req.body;
  const errors = validationResult(req);

   // handle express validation error
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      errorHandler(404, 'User not found');
    }

    // compare new password <---> previous password
    const isEqual = await bcrypt.compare(newPassword, user.password);

    if (isEqual) {
      errorHandler(
        406,
        'new password should not be the same with old password'
      );
    }

    const encrpyted_password = await bcrypt.hash(newPassword, 10);

    user.password = encrpyted_password;

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
}

export default resetUserPassword;
