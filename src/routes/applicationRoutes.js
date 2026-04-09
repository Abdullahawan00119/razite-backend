const express = require('express');
const { body } = require('express-validator');
const applicationController = require('../controllers/ApplicationController');
const upload = require('../config/multerConfig');
const { verifyJWT, verifyJWTFlexible, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateApplicant = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('district').notEmpty().withMessage('District is required')
];

// Routes for viewing applicants (Dashboard) - Protected
router.get('/', verifyJWT, requireAdmin, applicationController.getAllApplicants);
router.get('/dashboard/stats', verifyJWT, requireAdmin, applicationController.getDashboardStats);
router.get('/department/:department', verifyJWT, requireAdmin, applicationController.getApplicantsByDepartment);
router.get('/job/:jobId', verifyJWT, requireAdmin, applicationController.getApplicantsByJob);
router.get('/applicant/:applicantId', verifyJWT, requireAdmin, applicationController.getApplicantDetails);
router.get('/applicant/:applicantId/cv', verifyJWT, requireAdmin, applicationController.getCV);
router.get('/applicant/:applicantId/preview-cv', verifyJWTFlexible, requireAdmin, applicationController.previewCV);
router.get('/applicant/:applicantId/download-cv', verifyJWT, requireAdmin, applicationController.downloadCV);

// Routes for managing applicants - Protected
router.patch('/applicant/:applicantId/status', verifyJWT, requireAdmin, applicationController.updateApplicantStatus);
router.delete('/applicant/:applicantId', verifyJWT, requireAdmin, applicationController.deleteApplicant);

module.exports = router;
