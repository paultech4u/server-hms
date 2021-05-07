import express from 'express';
import createAdmin from './createAdmin.js';
import createHospital from './createHospital.js';
import rateLimitter from 'express-rate-limit';
import { body, check } from 'express-validator';

// Initialized the requests methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Private
 * @endpoints /api/register/admin
 */
router.post(
  '/register/admin',
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
  createAdmin
);

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
  createHospital
);

export default router;
