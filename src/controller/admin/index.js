import express from 'express';
import { body } from 'express-validator';
import AdminSignup from './adminAccountSignup';

// Initialize a request methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Public
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
  AdminSignup
);
