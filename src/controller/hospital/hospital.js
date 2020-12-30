import bcrypt from 'bcrypt';
import { Admin } from '../../model/admin';
// import { validationResult } from 'express-validator';
import { Hospital } from '../../model/hospital';
import { ErrorException } from '../../util/error';
import { User } from '../../model/user';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const HospitalRegistration = async function (req, res, next) {
  const { payload } = req.body;
  const { adminPayload, hospitalPayload } = payload;
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   res.status(406).json({
  //     error: errors.mapped(),
  //   });
  // }
  try {
    if (adminPayload.role !== 'ADMIN') {
      ErrorException(401, 'Unauthorized');
    }
    const user = await User.findOne({ email: adminPayload.email }).or([
      { username: adminPayload.username },
    ]);
    if (user) {
      ErrorException(302, 'User exist');
    }
    const hospital = await Hospital.findOne({ name: hospitalPayload.name });
    if (hospital !== null) {
      ErrorException(302, 'Hospital exist');
    }
    const newHospital = new Hospital({
      name: hospitalPayload.name,
      email: hospitalPayload.email,
      state: hospitalPayload.state,
      address: hospitalPayload.address,
      zip_code: hospitalPayload.zip_code,
    });

    const [saveNewHospital] = await Promise.all([newHospital.save()]);
    if (!saveNewHospital) {
      return Promise.reject('Cannot save');
    }
    const hashPassword = await bcrypt.hash(adminPayload.password, 10);
    const newUser = new User({
      email: adminPayload.email,
      firstname: adminPayload.email,
      surname: adminPayload.email,
      username: adminPayload.email,
      password: hashPassword,
      tel: adminPayload.phone_number,
      role: adminPayload.role,
    });
    newUser.hospital = saveNewHospital._id;
    newUser.isAdmin = true;
    const [saveNewUser] = await Promise.all([newUser.save()]);
    if (!saveNewUser) {
      return Promise.reject('Cannot save');
    }
    const admin = new Admin({
      isAdmin: true,
      status: true,
      hospital: saveNewHospital._id,
    });
    admin._id = saveNewUser._id;
    newHospital.admin = saveNewUser._id;
    admin.save();
    newHospital.save();
    res.status(201).json({
      messege: 'Created',
      Hospital: newHospital,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
