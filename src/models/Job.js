const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [150, 'Title must not exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance'],
    required: [true, 'Job type is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  district: {
    type: String,
    required: [true, 'District is required']
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'PKR'
    }
  },
  department: {
    type: String,
    enum: [
      'Engineering',
      'Design',
      'Product',
      'Marketing',
      'Sales',
      'HR',
      'Operations',
      'Other'
    ],
    required: [true, 'Department is required']
  },
  requirements: [{
    type: String
  }],
  responsibilities: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  experience: {
    type: String,
    enum: ['Fresher', 'Entry Level', 'Mid Level', 'Senior', 'Lead'],
    required: [true, 'Experience level is required']
  },
  skills: [{
    type: String
  }],
  applications: [{
    applicantId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    phone: String,
    resume: String,
    coverLetter: String,
    city: String,
    district: String,
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['open', 'closed', 'on-hold'],
    default: 'open'
  },
  featured: {
    type: Boolean,
    default: false
  },
  deadline: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);
