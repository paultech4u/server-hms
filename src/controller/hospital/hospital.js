import { Admin } from "../../model/admin";
import { Hospital } from "../../model/hospital";
import { error } from "../../util/error";

export const reg_hospital = async (req, res, next) => {
  const { name, email, state, address, id } = req.body;
  try {
    const admin = await Admin.findById(id);
    if (admin.isSuper === false) {
      error(401, "Unauthorized");
    }
    const hospital = await Hospital.findOne({ name: name });
    if (hospital) {
      return res.status(302).json({
        messege: "Hopital exist",
      });
    }
    const newHospital = new Hospital({
      name,
      email,
      state,
      address,
    });
    newHospital.creator = admin;
    newHospital.save();
    return res.status(201).json({
      messege: "Created",
      newHospital: newHospital,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
