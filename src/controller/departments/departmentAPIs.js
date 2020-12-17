import express from 'express';
import { body } from 'express-validator';
import {
  GetDepartment,
  EditDepartment,
  GetDepartments,
  DeleteDepartment,
  CreateDepartment,
} from '../departments/department';
import { isAuth } from '../../security/auth/authMiddleware';
const router = express.Router();

/**
 * @method POST
 * @access Private
 * @endpoints /api/department/create-department
 */
router.post(
  '/department/create-department',
  [
    body('name').not().isEmpty().trim(),
    body('description').not().isEmpty().trim(),
  ],
  isAuth,
  CreateDepartment
);

/**
 * @method GET
 * @access Public
 * @endpoints /api/department/create-department
 */
router.get('/department', GetDepartments);

/**
 * @method GET
 * @access Public
 * @endpoints /api/department/create-department
 */
router.get('/department/:id', GetDepartment);

/**
 * @method PUT
 * @access Private
 * @endpoints /api/department/create-department
 */
router.put('/department/:id',  isAuth, EditDepartment);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/department/create-department
 */
router.delete('/department/:id', isAuth, DeleteDepartment);

export default router;
