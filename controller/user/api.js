import express from 'express';
import loginUser from './loginUser.js';
import deleteUser from './deleteUser.js';
import createUser from './createUser.js';
import activateUser from './activateUser.js';
import refreshToken from './refreshToken.js';
import deactivateUser from './deactivateUser.js';
import forgetPassword from './forgetPassword.js';
import { uploads } from '../../service/multer.js';
import resetUserPassword from './resetPassword.js';
import { body, check } from 'express-validator';
import verifyUserEmail from './verifyUserEmail.js';
import getUserProfileDetails from './getProfileDetails.js';
import isAuthenticated from '../../auth/authMiddleware.js';
import { uploadProfilePicture } from './uploadProfilePicture.js';

// Initialize the request methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Public
 * @endpoints /api/register?user=[doctor, nurse, pharmacist]
 */
router.post(
  '/create-user',
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
    body(['username', 'department_name', 'hospital_name']).trim(),
  ],
  isAuthenticated,
  createUser
);

/**
 * @method GET
 * @access Public
 * @endpoints /api/confirm-email
 */
router.get('/confirm-email', verifyUserEmail);

/**
 * @method POST
 * @access Public
 * @endpoints /api/login
 */
router.post(
  '/login',
  check('email').not().isEmpty().normalizeEmail().trim(),
  loginUser
);

/**
 * @private
 * @method GET
 * @access Private
 * @endpoints /api/get-profile
 */
router.get('/get-profile', isAuthenticated, getUserProfileDetails);

/**
 * @method POST
 * @access Public
 * @endpoints /api/refresh-token
 */
router.post('/refresh', isAuthenticated, refreshToken);

/**
 * @private
 * @method PUT
 * @access Private
 * @endpoints /api/deactivate/:id
 */
router.put('/deactivate/:id', isAuthenticated, deactivateUser);

/**
 * @private
 * @method PUT
 * @access Private
 * @endpoints /api/activate/:id
 */
router.put('/activate/:id', isAuthenticated, activateUser);

/**
 * @method PUT
 * @access Private
 * @endpoints /api/reset-password
 */
router.put(
  '/reset-password',
  [body('password').not().isEmpty().isLength({ max: 30, min: 8 }).trim()],
  isAuthenticated,
  resetUserPassword
);

/**
 * @method POST
 * @access Public
 * @endpoints /api/forget-password
 */
router.post(
  '/forget-password',
  [
    body('email').isEmail().withMessage('must be an email'),
    body('password1')
      .not()
      .isEmpty()
      .trim()
      .withMessage('must contain a character value'),
    body('password2')
      .not()
      .isEmpty()
      .trim()
      .withMessage('must contain a character value'),
  ],
  forgetPassword
);

/**
 * @method POST
 * @access Private
 * @endpoints /api/upload-image
 */
router.post(
  '/upload-image',
  uploads.single('avatar'),
  isAuthenticated,
  uploadProfilePicture
);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/delete/:token
 */
router.delete('/delete', isAuthenticated, deleteUser);

export default router;
