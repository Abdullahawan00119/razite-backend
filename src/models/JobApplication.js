const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: null
  },
  jobTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  categoryType: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Applicant name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  district: {
    type: String,
    required: [true, 'District is required']
  },
  resume: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter must not exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  experience: {
    type: String,
    required: false
  },
  skills: {
    type: [String],
    required: false
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes must not exceed 500 characters']
  }
}, { timestamps: true });

// Index for faster queries
jobApplicationSchema.index({ jobId: 1, status: 1 });
jobApplicationSchema.index({ department: 1 });
jobApplicationSchema.index({ email: 1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
