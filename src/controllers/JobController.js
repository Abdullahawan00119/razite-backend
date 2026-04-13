const Job = require('../models/Job');
const { validationResult } = require('express-validator');

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

// Apply for a job - DISABLED (applicant backend removed)
exports.applyForJob = async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Job applications have been disabled. Contact admin for opportunities.'
  });
};

// Apply for general position - DISABLED (applicant backend removed)
exports.applyForJobGeneral = async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'General job applications have been disabled. Contact admin for opportunities.'
  });
};
