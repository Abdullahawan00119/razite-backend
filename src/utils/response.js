// Success response formatter
const successResponse = (res, status = 200, message = 'Success', data = null) => {
  return res.status(status).json({
    success: true,
    message,
    ...(data && { data })
  });
};

// Error response formatter
const errorResponse = (res, status = 500, message = 'Error', errors = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

// Async handler wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  successResponse,
  errorResponse,
  asyncHandler
};
