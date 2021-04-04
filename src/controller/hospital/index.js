import express from 'express';
import { body, check } from 'express-validator';
import RateLimitter from 'express-rate-limit';
import addNewHospital from './addNewHospital';
import { GetDepartment } from './adminGetDapartment';
import addNewHospitalAdmin from './addNewHospitalAdmin';
import { EditDepartment } from './adminEditDepartment';
import { GetDepartments } from './adminGetDepartments';
import isAuthenticated from '../../auth/authMiddleware';
import { DeleteDepartment } from './adminDeleteDepartment';
import { CreateDepartment } from './adminCreateDepartment';

// Initialized the requests methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Private
 * @endpoints /api/signup?role=admin
 */
router.post(
  '/hospital/signup',
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

const register_ratelimiter = RateLimitter({
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
