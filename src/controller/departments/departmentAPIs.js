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
 * @endpoints /api/department/create
 */
router.post(
  '/department/create',
  [
    body('name').not().isEmpty().trim(),
    body('description').not().isEmpty().trim(),
  ],
  CreateDepartment
);

/**
 * @method GET
 * @access Public
 * @endpoints /api/department
 */
router.get('/department', GetDepartments);

/**
 * @method GET
 * @access Public
 * @endpoints /api/department/:id
 */
router.get('/department/:id', GetDepartment);

/**
 * @method PUT
 * @access Private
 * @endpoints /api/department/:id
 */
router.put('/department/:id', isAuth, EditDepartment);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/department/create-department
 */
router.delete('/department/:id', isAuth, DeleteDepartment);

export default router;
