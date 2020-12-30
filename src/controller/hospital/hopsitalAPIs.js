import express from 'express';
// import { body } from 'express-validator';
import { HospitalRegistration } from '../hospital/hospital';
import { isAuth } from '../../security/auth/authMiddleware';

const router = express.Router();

router.post('/hospital/register', HospitalRegistration);

export default router;
