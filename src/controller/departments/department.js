// const express  = require("express");
const { validationResult } = require("express-validator");

const { departments } = require("../../model/department");

exports.create_department = async (req, res, next) => {
  const errors = validationResult(req);
  // TODO check if errors is empty.
  if (!errors.isEmpty()) {
    const error = new Error("Invalid request");
    error.status = 400;
    throw error;
  }
  try {
    const docName = req.body.name;
    const description = req.body.description;
    const doc = await departments.schema.path("name").options.enum;
    // TODO check for an exiting doc name with correspond to the new name
    if (doc.includes(docName)) {
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
      return res.status(400).json({
        message: `${docName} is not a valid departments`,
      });
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

exports.get_department = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("invalid request");
    error.status = 400;
    throw error;
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
        // TODO check if department is available;
        const error = new Error("No docs found");
        error.status = 200;
        throw error;
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

exports.edit_department = async (req, res, next) => {
  // TODO
};
