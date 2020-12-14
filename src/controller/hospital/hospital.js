import { Admin } from "../../model/admin";
import { validationResult } from "express-validator";
import { Hospital } from "../../model/hospital";
import { ErrorException } from "../../util/error";

/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const HospitalRegistration = async function (req, res, next) {
  const { name, email, state, address, zip_code } = req.body;
  const { userID } = req;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  try {
    const admin = await Admin.findById(userID);
    if (admin.isAdmin === false) {
      ErrorException(401, "Unauthorized");
    }
    const hospital = await Hospital.findOne({ name: name });
    if (hospital) {
      ErrorException(302, "Hopital exist");
    }
    const newHospital = new Hospital({
      name,
      email,
      state,
      address,
      zip_code,
    });
    newHospital.admin = admin._id;
    newHospital.save();
    res.status(201).json({
      messege: "Created",
      Hospital: newHospital,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
