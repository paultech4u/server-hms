import express from 'express';
import editPatient from './editPatient.js';
import createPatient from './createPatient.js';
import deletePatient from './deletePatient.js';
import isAuthenticated from '../../auth/authMiddleware.js';
import createPatientCheckup from './createPatientCheckup.js';

// Initialized the requests methods and routes.
const router = express.Router();

/**
 * @method POST
 * @access Private
 * @endpoints /api/register?user=patient
 */
router.post('/create-patient', isAuthenticated, createPatient);

/**
 * @method DELETE
 * @access Private
 * @endpoints /api/delete-patient
 */
router.post('/delete-patient', isAuthenticated, deletePatient);

/**
 * @method POST
 * @access Private
 * @endpoints /api/edit-patient
 */
router.post('/edit-patient', isAuthenticated, editPatient);

/**
 * @method POST
 * @access Private
 * @endpoints /api/add-patient
 */
 router.post('/add-checkup', isAuthenticated, createPatientCheckup);


export default router;
