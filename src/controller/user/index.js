import express from 'express';
import loginUser from './userLoginAccount';
import deleteUser from './userDeleteAccount';
import addNewUser from './userAccountSignup';
import { uploads } from '../../service/multer';
import { body, check } from 'express-validator';
import getUserProfile from './userGetAccountProfile';
import refreshToken from './userRefreshAccountTokens';
import isAuthenticated from '../../auth/authMiddleware';
import resetUserPassword from './userResetAccountPassword';
import userForgetPassword from './userForgetAccountPassword';
import deactivateUserAccount from './userDeactivateAccount';
import verifyUserEmail from './userAccountVerification';
import { uploadProfileAvatar } from './userAccountUploadProfilePicture';

// Initialize a request methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Public
 * @endpoints /api/add-account
 */
router.post(
  '/user/add-account',
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
    body(['username', 'department']).trim(),
  ],

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
router.get('/user/get-profile', isAuthenticated, getUserProfile);

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
 * @endpoints /api/deactivate
 */
router.put('/user/deactivate', isAuthenticated, deactivateUserAccount);

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
      .withMessage('must contain a character value')
  ],
  userForgetPassword
);

/**
 * @method PUT
 * @access Private
 * @endpoints /api/profile
 */
router.put(
  '/user/profile',
  uploads.single('avatar'),
  isAuthenticated,
  uploadProfileAvatar
);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/delete/:token
 */
router.delete('/user/delete', isAuthenticated, deleteUser);

export default router;
