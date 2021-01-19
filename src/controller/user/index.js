import express from 'express';
import UserLogin from './userLoginAccount';
import UserDelete from './userDeleteAccount';
import UserSignup from './userAccountSignup';
import { uploads } from '../../service/multer';
import { body, check } from 'express-validator';
import UserGetProfile from './userGetAccountProfile';
import RefreshToken from './userRefreshAccountTokens';
import isAuthenticated from '../../auth/authMiddleware';
import UserResetPassword from './userResetAccountPassword';
import UserForgetPassword from './userForgetAccountPassword';
import UserAccountDeactivation from './userDeactivateAccount';
import UserEmailVerification from './userAccountVerification';
import { UploadProfilePicture } from './userAccountUploadProfilePicture';

// Initialize a request methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Public
 * @endpoints /api/signup
 */
router.post(
  '/user/signup',
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

  UserSignup
);

/**
 * @method GET
 * @access Public
 * @endpoints /api/confirm-email
 */
router.get('/user/confirm-email', UserEmailVerification);

/**
 * @method POST
 * @access Public
 * @endpoints /api/login
 */
router.post(
  '/user/login',
  check('email').not().isEmpty().normalizeEmail().trim(),
  UserLogin
);

/**
 * @private
 * @method POST
 * @access Private
 * @endpoints /api/get-profile
 */
router.get('/user/get-profile', isAuthenticated, UserGetProfile);

/**
 * @method POST
 * @access Public
 * @endpoints /api/refresh-token
 */
router.post('/refresh', isAuthenticated, RefreshToken);

/**
 * @private
 * @method PUT
 * @access Private
 * @endpoints /api/deactivate
 */
router.put('/user/deactivate', isAuthenticated, UserAccountDeactivation);

/**
 * @method PUT
 * @access Private
 * @endpoints /api/reset-password
 */
router.put(
  '/user/reset-password',
  [body('password').not().isEmpty().isLength({ max: 30, min: 8 }).trim()],
  isAuthenticated,
  UserResetPassword
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
    body('password')
      .not()
      .isEmpty()
      .trim()
      .withMessage('must contain a character value'),
  ],
  UserForgetPassword
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
  UploadProfilePicture
);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/delete/:token
 */
router.delete('/user/delete', isAuthenticated, UserDelete);

export default router;
