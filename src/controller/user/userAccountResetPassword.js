import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import { ErrorException } from '../../util/error';
import { validationResult } from 'express-validator';

const UserResetPassword = async function (req, res, next) {
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

export default UserResetPassword;
