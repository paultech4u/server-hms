// const express  = require("express");
import { Admin } from '../../model/admin';
import { Hospital } from '../../model/hospital';
import { ErrorException } from '../../util/error';
import { validationResult } from 'express-validator';
import { Department } from '../../model/department';

/**
 * @typedef {Request} req
 * @typedef {Response} res
 */

/**
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const CreateDepartment = async function (req, res, next) {
  const { name, description, hospital } = req.body;
  // Get admin id from auth token
  const { id } = req.query;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(412).json({
      message: errors.mapped(),
    });
  }
  try {
    const admin = await Admin.findById(id);
    // TODO extract admin id from hospital
    const hospitals = await Hospital.findOne({ name: hospital });
    if (!hospitals) {
      ErrorException(404, 'Hospital not found');
    }
    if (hospitals.admin !== id) {
      if (admin.isAdmin !== true) ErrorException(401, 'Unauthorized');
    }
    const department = await Department.findOne({
      name: name,
    });
    // TODO check for an exiting department
    if (department) {
      ErrorException(302, 'Department exists');
    }
    const newDepartment = new Department({
      name: name,
      description: description,
      creator: hospitals.admin,
      hospital: hospitals._id,
    });
    // TODO save to database
    newDepartment.save();
    res.status(201).json({
      message: 'Created!',
      newDepartment: newDepartment,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const GetDepartments = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  const perPage = 5;
  const currentPage = 1;
  try {
    // TODO get all document in the department collection
    const departments = await Department.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .orFail(() => {
        // TODO throw error if department is not available
        ErrorException(404, 'No Departments found');
      })
      .populate(
        'hospital',
        'name email state creation address admin zip_code -_id'
      );
    // TODO number of available departments
    const totalDepartments = await Department.find().countDocuments();

    res.status(200).json({
      message: 'Fetched departments successful!',
      departments: departments,
      totalDepartments: totalDepartments,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
// TODO get a single department
export const GetDepartment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  }
  const { id } = req.params;
  const department = await Department.findById(id);
  try {
    if (!department) {
      ErrorException(404, 'Department not found');
    }
    res.status(200).json({
      message: 'Fetched department successful!',
      department: department,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const EditDepartment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(406).json({
      error: errors.mapped(),
    });
  } // TODO check if department exists
  // TODO send a res if department exist
  const { id } = req.params; // department id
  const { name, description } = req.body;

  const department = await Department.findById(id).updateOne(
    {},
    { name: name, department: description }
  );
  try {
    if (!department) {
      ErrorException(404, 'Department not found');
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

/**
 * @param  {object} req request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 */
export const DeleteDepartment = async (req, res, next) => {
  const { id } = req.params;
  const department = await Department.findByIdAndDelete(id);
  try {
    if (!department) {
      res.status(404).json({
        message: 'DEPARTMENT_NOT_FOUND',
      });
    }
    res.status(200).json({
      message: 'Deleted',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
