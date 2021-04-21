import express from 'express';
import isAuthenticated from '../../auth/authMiddleware';
import registerPatient from './registerPatient';

const router = express.Router();

/**
 * @method POST
 * @access Private
 * @endpoints /api/register-patient
 */
router.post('/register-patient', isAuthenticated, registerPatient);

export default router;
