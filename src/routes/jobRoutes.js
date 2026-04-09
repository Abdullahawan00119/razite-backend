const express = require('express');
const { body } = require('express-validator');
const jobController = require('../controllers/JobController');
const upload = require('../config/multerConfig');
const { verifyJWT, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware for job creation/update
const validateJob = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').notEmpty().withMessage('Job type is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('department').notEmpty().withMessage('Department is required')
];

// Validation middleware for job application
const validateApplication = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('district').notEmpty().withMessage('District is required')
];

// Routes
router.get('/', jobController.getAllJobs);
router.post('/apply/general', upload.single('resume'), validateApplication, jobController.applyForJobGeneral);
router.get('/:id', jobController.getJobById);
router.post('/', verifyJWT, requireAdmin, validateJob, jobController.createJob);
router.put('/:id', verifyJWT, requireAdmin, validateJob, jobController.updateJob);
router.delete('/:id', verifyJWT, requireAdmin, jobController.deleteJob);
router.post('/:id/apply', upload.single('resume'), validateApplication, jobController.applyForJob);

module.exports = router;
