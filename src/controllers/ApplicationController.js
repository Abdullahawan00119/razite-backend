const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Get all applicants
exports.getAllApplicants = async (req, res) => {
  try {
    const { status, department, jobId, sortBy, startDate, endDate } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (department) filter.department = department;
    if (jobId) filter.jobId = jobId;

    // Date range filter
    if (startDate || endDate) {
      filter.appliedAt = {};
      if (startDate) filter.appliedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        filter.appliedAt.$lte = end;
      }
    }

    let query = JobApplication.find(filter);

    // Sorting options
    if (sortBy === 'latest') {
      query.sort({ appliedAt: -1 });
    } else if (sortBy === 'oldest') {
      query.sort({ appliedAt: 1 });
    } else {
      query.sort({ appliedAt: -1 }); // Default: latest first
    }

    const applicants = await query
      .select('-resume.path')
      .populate('jobId', 'title department');

    res.status(200).json({
      success: true,
      count: applicants.length,
      data: applicants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get applicants by department/category
exports.getApplicantsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const { status } = req.query;

    let filter = { department };
    if (status) filter.status = status;

    const applicants = await JobApplication.find(filter)
      .select('-resume.path')
      .populate('jobId', 'title department')
      .sort({ appliedAt: -1 });

    // Group by job
    const groupedByJob = {};
    applicants.forEach(app => {
      const jobTitle = app.jobTitle;
      if (!groupedByJob[jobTitle]) {
        groupedByJob[jobTitle] = [];
      }
      groupedByJob[jobTitle].push(app);
    });

    res.status(200).json({
      success: true,
      department,
      totalApplicants: applicants.length,
      groupedByJob,
      data: applicants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get applicants for a specific job
exports.getApplicantsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    let filter = { jobId };
    if (status) filter.status = status;

    const applicants = await JobApplication.find(filter)
      .select('-resume.path')
      .sort({ appliedAt: -1 });

    // Get job details
    const job = await Job.findById(jobId).select('title department');

    // Count by status
    const statusCount = {
      pending: applicants.filter(a => a.status === 'pending').length,
      reviewed: applicants.filter(a => a.status === 'reviewed').length,
      shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
      rejected: applicants.filter(a => a.status === 'rejected').length,
      hired: applicants.filter(a => a.status === 'hired').length
    };

    res.status(200).json({
      success: true,
      job,
      totalApplicants: applicants.length,
      statusCount,
      data: applicants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single applicant details
exports.getApplicantDetails = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const applicant = await JobApplication.findById(applicantId)
      .populate('jobId', 'title department description type');

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: applicant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update applicant status
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const applicant = await JobApplication.findByIdAndUpdate(
      applicantId,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Applicant status updated successfully',
      data: applicant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Download CV
exports.downloadCV = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const applicant = await JobApplication.findById(applicantId);

    if (!applicant || !applicant.resume || !applicant.resume.path) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    const filePath = applicant.resume.path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.setHeader('Content-Type', applicant.resume.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${applicant.resume.filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: 'Error downloading file'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Preview CV (view inline)
exports.previewCV = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const applicant = await JobApplication.findById(applicantId);

    if (!applicant || !applicant.resume || !applicant.resume.path) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    const filePath = applicant.resume.path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Serve file inline for preview instead of download
    res.setHeader('Content-Type', applicant.resume.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${applicant.resume.filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: 'Error reading file'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get CV metadata (view CV info without download)
exports.getCV = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const applicant = await JobApplication.findById(applicantId)
      .select('name email resume');

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    if (!applicant.resume) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    res.status(200).json({
      success: true,
      applicantName: applicant.name,
      email: applicant.email,
      resume: {
        filename: applicant.resume.filename,
        size: applicant.resume.size,
        uploadedAt: applicant.resume.uploadedAt,
        mimetype: applicant.resume.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalApplicants = await JobApplication.countDocuments();
    
    const statsByStatus = await JobApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsByDepartment = await JobApplication.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentApplications = await JobApplication.find()
      .sort({ appliedAt: -1 })
      .limit(10)
      .select('name email jobTitle department status appliedAt');

    res.status(200).json({
      success: true,
      totalApplicants,
      byStatus: statsByStatus,
      byDepartment: statsByDepartment,
      recentApplications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete applicant
exports.deleteApplicant = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const applicant = await JobApplication.findByIdAndDelete(applicantId);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    // Delete CV file if exists
    if (applicant.resume && applicant.resume.path) {
      try {
        if (fs.existsSync(applicant.resume.path)) {
          fs.unlinkSync(applicant.resume.path);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Applicant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
