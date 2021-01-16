import express from 'express';
import { body } from 'express-validator';
import rateLimitter from 'express-rate-limit';
import { HospitalRegistration } from '../hospital/hospital';
// import { isAuth } from '../../security/auth/authMiddleware';

const router = express.Router();

const register_ratelimit = rateLimitter({
  windowMs: 3 * 60 * 1000,
  max: 5,
  message: 'To many requests sents',
});

router.post(
  '/hospital/register',
  [
    body('hospital_email').isEmail(),
    body('zip_code').isNumeric().trim(),
    body(['hospital_name', 'state', 'address']).trim(),
  ],
  register_ratelimit,
  HospitalRegistration
);

export default router;
