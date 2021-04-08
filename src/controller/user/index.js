import express from 'express';
import loginUser from './loginUser';
import deleteUser from './deleteUser';
import addNewUser from './addNewUser';
import activateUser from './activateUser';
import refreshToken from './refreshToken';
import deactivateUser from './deactivateUser';
import forgetPassword from './forgetPassword';
import { uploads } from '../../service/multer';
import resetUserPassword from './resetPassword';
import { body, check } from 'express-validator';
import verifyUserEmail from './verifyUserEmail';
import getUserProfileDetails from './getProfileDetails';
import isAuthenticated from '../../auth/authMiddleware';
import { uploadProfilePicture } from './uploadProfilePicture';

// Initialize a request methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Public
 * @endpoints /api/add-user
 */
router.post(
  '/user/add-user',
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
  addNewUser
);

/**
 * @method GET
 * @access Public
 * @endpoints /api/confirm-email
 */
router.get('/user/confirm-email', verifyUserEmail);

/**
 * @method POST
 * @access Public
 * @endpoints /api/login
 */
router.post(
  '/user/login',
  check('email').not().isEmpty().normalizeEmail().trim(),
  loginUser
);

/**
 * @private
 * @method POST
 * @access Private
 * @endpoints /api/get-profile
 */
router.get('/user/get-profile', isAuthenticated, getUserProfileDetails);

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
router.put('/user/deactivate/:id', isAuthenticated, deactivateUser);

/**
 * @private
 * @method PUT
 * @access Private
 * @endpoints /api/activate/:id
 */
router.put('/user/activate/:id', isAuthenticated, activateUser);

/**
 * @method PUT
 * @access Private
 * @endpoints /api/reset-password
 */
router.put(
  '/user/reset-password',
  [body('password').not().isEmpty().isLength({ max: 30, min: 8 }).trim()],
  isAuthenticated,
  resetUserPassword
);

/**
 * @method PUT
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
  '/user/upload-image',
  uploads.single('avatar'),
  isAuthenticated,
  uploadProfilePicture
);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/delete/:token
 */
router.delete('/user/delete', isAuthenticated, deleteUser);

export default router;
