import express from 'express';
import { body } from 'express-validator';
import RateLimitter from 'express-rate-limit';
import HospitalAccountReg from './hospitalAccountReg';
// import { isAuth } from '../../security/auth/authMiddleware';

const router = express.Router();

const register_ratelimit = RateLimitter({
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
  HospitalAccountReg
);

export default router;
