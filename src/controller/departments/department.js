// const express  = require("express");
import { validationResult } from "express-validator";
import { Department } from "../../model/department";
import { User } from "../../model/user";
import { Admin } from "../../model/admin";
import { Hospital } from "../../model/hospital";
import { error } from "../../util/error";

export const create_department = async (req, res, next) => {
  const { name, description, id, hospital } = req.body;
  try {
    // Todo Two way steps of creating departments
    // Todo if user is an admin
    // Todo if admin is super
    // const user = await User.findById(id);
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    if (admin) {
      if (admin.isAdmin !== true) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
    }

    const department = await Department.findOne({
      name: name,
    });
    // TODO check for an exiting department
    if (department) {
      return res.status(302).json({
        message: "Department exits",
      });
    }
    const hospitals = await Hospital.find().select("departments");
    if (!hospitals) {
      error(404, "No hospitals");
    }

    const check = () => {
      for (let x of hospitals) {
        const y = x.departments;
        if (y.lenght === -1) {
          return false;
        }
        for (let props of y) {
          if (department && props === department._id) {
            return false;
          }
          return true;
        }
      }
    };
    if (check() === false) {
      error(406, "Department exist");
    }
    const hospitalName = await Hospital.findOne({ name: hospital });
    const newDepartment = new Department({
      name: name,
      description: description,
      isActive: true,
    });
    // TODO save to database
    newDepartment.creator = admin;
    newDepartment.hospital = hospitalName.name;
    newDepartment.save();
    hospitalName.departments.push(newDepartment);
    hospitalName.save();
    return res.status(201).json({
      message: "Created!",
      newDepartment: newDepartment,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const get_departments = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error(400, errors.msg);
  }
  const perPage = 5;
  const currentPage = 1;
  try {
    // TODO get all document in the department collection
    const department = await Department.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .orFail(() => {
        // TODO throw error if department is not available
        error(204, "No departments");
      })
      .populate("hospital", "name admins state creator -_id departments");
    // TODO number of available departments
    const totalDepartments = await Department.find().countDocuments();

    res.status(200).json({
      message: "Fetched departments successful!",
      departments: department,
      totalDepartments: totalDepartments,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const get_department = async (req, res, next) => {
  // TODO get a single department
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error(400, errors.msg);
  }
  const { id } = req.params;
  const department = await Department.findById(id);
  try {
    if (!department) {
      error(404, "Department not found");
    }
    res.status(200).json({
      message: "Fetched department successful!",
      department: department,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const edit_department = async (req, res, next) => {
  // TODO check if department exists
  // TODO send a res if department exist
  const { id } = req.params; // department id
  const { name, description } = req.body;

  const department = await Department.findById({ _id: id }).updateOne(
    {},
    {
      name: name,
      description: description,
    },
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return result;
    }
  );
  try {
    if (!department) {
      res.status(404).json({
        message: "Department not found",
      });
    }
    res.status(200).json({
      message: `Department updated`,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const change_user_department = async (req, res, next) => {};

export const delete_department = async (req, res, next) => {
  const { id } = req.params;
  const department = await Department.findByIdAndDelete({ _id: id });
  try {
    if (!department) {
      res.status(404).json({
        message: "DEPARTMENT_NOT_FOUND",
      });
    }
    res.status(200).json({
      message: "Deleted",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
