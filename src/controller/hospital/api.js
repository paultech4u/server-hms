import express from 'express';
import getDepartment from './getDapartment';
import addNewHospital from './addNewHospital';
import rateLimitter from 'express-rate-limit';
import editDepartment from './editDepartment';
import getDepartments from './getDepartments';
import { body, check } from 'express-validator';
import deleteDepartment from './deleteDepartment';
import createDepartment from './createDepartment';
import addNewHospitalAdmin from './addNewHospitalAdmin';
import isAuthenticated from '../../auth/authMiddleware';

// Initialized the requests methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Private
 * @endpoints /api/admin/register?role=admin
 */
router.post(
  '/admin/register',
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
    body(['firstname', 'lastname'])
      .not()
      .isEmpty()
      .trim()
      .withMessage('must contain a character'),
    body(['username']).trim(),
  ],
  addNewHospitalAdmin
);

// Hospital APIs

const register_ratelimiter = rateLimitter({
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
    body('email').isEmail(),
    body('zip_no').isNumeric().trim(),
    body(['name', 'state', 'address']).trim(),
  ],
  register_ratelimiter,
  addNewHospital
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
  createDepartment
);

/**
 * @method GET
 * @access Public
 * @endpoints /api/department/:name
 */
router.get('/department/:name', getDepartments);

/**
 * @method GET
 * @access Public
 * @endpoints /api/departments?id=unique_id
 */
router.get('/department', getDepartment);

/**
 * @method PUT
 * @access Private
 * @endpoints /api/departments/edit?id=unique_id
 */
router.put('/department/edit', isAuthenticated, editDepartment);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/departments/delete?id=unique_id
 */
router.delete('/department/delete', isAuthenticated, deleteDepartment);

export default router;
