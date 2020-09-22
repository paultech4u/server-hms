// const express  = require("express");
const { validationResult } = require("express-validator");

const { departments } = require("../../model/department");
const { error } = require("../../util/error");

exports.create_department = async (req, res, next) => {
  const errors = validationResult(req);
  // TODO check if errors is empty.
  if (!errors.isEmpty()) {
    error(400, "Invalid request");
  }
  try {
    const docName = req.body.name;
    const description = req.body.description;
    const doc = await departments.findOne().where({ name: docName });
    // TODO check for an exiting doc name with correspond to the new name
    if (!doc) {
      const newDepartment = new departments({
        name: docName,
        description: description,
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

exports.get_departments = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error(400, "Invalid request");
  }
  const perPage = 5;
  const currentPage = 1;
  try {
    // TODO get all document in the department collection
    const department = await departments
      .find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .orFail(() => {
        // TODO throw error if department is not available
        error(404, "no department found");
      });
    // TODO number of available departments
    const totalDepartments = await departments.find().countDocuments();

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

exports.get_department = async (req, res, next) => {
  // TODO get a single department
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error(400, "invalid request");
  }
  const departmentId = req.params.departmentId;
  const department = departments.findById(departmentId).exec();
  try {
    if (!department) {
      error(404, "department not found");
    }
    res.status(200).json({
      message: "department fetched",
      department: (await department).toJSON(),
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

exports.edit_department = async (req, res, next) => {
  // TODO
};

exports.change_user_department = async (req, res, next) => {};

exports.delete_department = async (req, res, next) => {
  const departmentId = req.params.departmentId;
  const department = await departments.findByIdAndDelete(
    departmentId,
    (err, doc) => {
      if (error) {
        return err;
      }
      return doc;
    }
  );
  try {
    if (department === null) {
      res.status(200).json({
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
