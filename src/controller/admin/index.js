import express from 'express';
import { body } from 'express-validator';
import RateLimitter from 'express-rate-limit';
import {
  GetDepartment,
  EditDepartment,
  GetDepartments,
  DeleteDepartment,
  CreateDepartment,
} from './adminCreateDepartment';
import isAuthenticated from '../../auth/authMiddleware';
import adminAccountSignup from './adminAccountSignup';
import createHospital from '../admin/adminCreateHospital';

// Initialize a request methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Private
 * @endpoints /api/signup
 */
router.post(
  '/admin/signup',
  [
    body('email')
      .not()
      .isEmpty()
      .normalizeEmail({ all_lowercase: false })
      .trim(),
    body('phone_number').isNumeric().isMobilePhone().not().isEmpty(),
    check('password')
      .isLength({ min: 8, max: 20 })
      .withMessage('must contain a number')
      .not()
      .isEmpty()
      .trim(),
    body(['role', 'firstname', 'lastname'])
      .not()
      .isEmpty()
      .trim()
      .withMessage('must contain a character'),
    body(['username']).trim(),
  ],
  adminAccountSignup
);

// Hospital APIs

const register_ratelimit = RateLimitter({
  windowMs: 3 * 60 * 1000,
  max: 5,
  message: 'To many requests sents',
});

/**
 * @method POST
 * @access Private
 * @endpoints /api/register
 */
router.post(
  '/register',
  [
    body('hospital_email').isEmail(),
    body('zip_code').isNumeric().trim(),
    body(['hospital_name', 'state', 'address']).trim(),
  ],
  register_ratelimit,
  createHospital
);

// Department APIs

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
router.put('/department/:id', isAuthenticated, EditDepartment);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/department/create-department
 */
router.delete('/department/:id', isAuthenticated, DeleteDepartment);

export default router;
