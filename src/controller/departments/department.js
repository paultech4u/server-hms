// const express  = require("express");
import { validationResult } from "express-validator";
import { Department } from "../../model/department";
import { error } from "../../util/error";

export const create_department = async (req, res, next) => {
  const errors = validationResult(req);
  // TODO check if errors is empty.
  if (!errors.isEmpty()) {
    error(400, "Invalid request");
  }
  try {
    const departmentName = req.body.departmentName;
    const description = req.body.description;
    const creatorRole = req.body.creator;
    const doc = await Department.findOne().where({
      departmentName: departmentName,
    });
    // TODO check for an exiting doc name with correspond to the new name
    if (!doc) {
      const newDepartment = new Department({
        departmentName: departmentName,
        description: description,
        creator: {
          role: creatorRole,
        },
      });
      // TODO save to database
      newDepartment.save();
      return res.status(201).json({
        message: "Created!",
        newDepartment: newDepartment,
      });
    } else {
      error(400, "department exists");
    }
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
    error(400, "Invalid request");
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
        error(404, "no department found");
      });
    // TODO number of available departments
    const totalDepartments = await Department.find().countDocuments();

    res.status(200).json({
      message: "success !",
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
    error(400, "invalid request");
  }
  const departmentId = req.params.departmentId;
  const department = await Department.findById(departmentId);
  try {
    if (!department) {
      error(404, "department not found");
    }
    res.status(200).json({
      message: "department fetched",
      department: department.toJSON(),
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
  const departmentId = req.params.departmentId;
  const name = req.body.name;
  const description = req.body.description;
  const creatorRole = req.body.creator;
  const department = await Department.findById({ _id: departmentId }).updateOne(
    {},
    {
      departmentName: name,
      description: description,
      creator: { role: creatorRole },
    },
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return result;
    }
  );
  try {
    if (department === null) {
      res.status(404).json({
        message: `department not found`,
        department: department,
      });
    }
    res.status(200).json({
      message: `update successful !`,
      updatedDepartment: department,
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
  const departmentId = req.params.departmentId;
  const department = await Department.findByIdAndDelete({ _id: departmentId });
  try {
    if (!department) {
      res.status(404).json({
        message: `department not found`,
        department: department,
      });
    }
    res.status(200).json({
      message: `successfully deleted ${departmentId}`,
      department: department,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
