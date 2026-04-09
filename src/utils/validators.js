const { validationResult } = require('express-validator');

// Check validation errors middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Slug generator utility
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[/^\s+]/g, '-')
    .replace(/[^w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
};

module.exports = {
  validateRequest,
  generateSlug
};
