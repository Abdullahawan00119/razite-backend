const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { validationResult } = require('express-validator');
const { sendApplicationEmail } = require('../utils/email');
const fs = require('fs');
const path = require('path');

// Get all jobs with filters
exports.getAllJobs = async (req, res) => {
  try {
    const { status, type, department, featured, city } = req.query;
    let filter = { status: 'open' };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (department) filter.department = department;
    if (featured === 'true') filter.featured = true;
    if (city) filter.city = city;

    const jobs = await Job.find(filter)
      .select('-applications')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new job
exports.createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const job = new Job(req.body);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, coverLetter, city, district, experience, skills } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Save to JobApplication model
    const jobApplication = new JobApplication({
      jobId: id,
      jobTitle: job.title,
      department: job.department || 'General',
      categoryType: job.type,
      name,
      email,
      phone,
      resume: {
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      coverLetter,
      city,
      district,
      experience,
      skills: skills ? (Array.isArray(skills) ? skills : [skills]) : [],
      status: 'pending'
    });

    await jobApplication.save();

    // Send email notification with error handling
    try {
      await sendApplicationEmail(jobApplication);
    } catch (emailError) {
      console.error('Email send failed but application saved:', emailError.message);
      // Don't fail the application if email fails
    }

    // Also keep application in Job model for backward compatibility
    const application = {
      name,
      email,
      phone,
      resume: {
        filename: req.file.originalname,
        size: req.file.size
      },
      coverLetter,
      city,
      district,
      status: 'pending'
    };

    job.applications.push(application);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicantId: jobApplication._id,
      data: jobApplication
    });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application: ' + error.message
    });
  }
};

// Apply for a job - Generic (no specific job required)
exports.applyForJobGeneral = async (req, res) => {
  try {
    const { name, email, phone, coverLetter, city, district, position, experience, skills } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // Save to JobApplication model without requiring a job ID
    const jobApplication = new JobApplication({
      jobId: null,
      jobTitle: position || 'Open Position',
      department: 'Careers',
      categoryType: 'General Application',
      name,
      email,
      phone,
      resume: {
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      coverLetter,
      city,
      district,
      experience,
      skills: skills ? (Array.isArray(skills) ? skills : [skills]) : [],
      status: 'pending'
    });

    await jobApplication.save();

    // Send email notification with error handling
    try {
      await sendApplicationEmail(jobApplication);
    } catch (emailError) {
      console.error('Email send failed but application saved:', emailError.message);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicantId: jobApplication._id,
      data: jobApplication
    });
  } catch (error) {
    console.error('General job application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application: ' + error.message
    });
  }
};
