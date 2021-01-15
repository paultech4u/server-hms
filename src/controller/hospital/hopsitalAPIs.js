import express from 'express';
import { body } from 'express-validator';
import rateLimitter from 'express-rate-limit';
import { HospitalRegistration } from '../hospital/hospital';
// import { isAuth } from '../../security/auth/authMiddleware';

const router = express.Router();

const register_ratelimit = rateLimitter({
  windowMs: 15 * 60 * 1000,
  max: 2,
  message: 'To many requests sents',
});

router.post(
  '/hospital/register',
  [
    body('hospital_email').isEmail().not().isEmpty(),
    body('zip_code').isNumeric().trim(),
    body(['hospital_name', 'state', 'address']).trim(),
  ],
  register_ratelimit,
  HospitalRegistration
);

export default router;
