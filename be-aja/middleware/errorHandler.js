// Global error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
  
    // Default error
    let error = { ...err };
    error.message = err.message;
  
    // PostgreSQL errors
    if (err.code === '23505') {
      // Duplicate key error
      const message = 'Duplicate resource';
      error = { message, statusCode: 400 };
    }
  
    if (err.code === '23503') {
      // Foreign key constraint error
      const message = 'Resource not found';
      error = { message, statusCode: 404 };
    }
  
    if (err.code === '23502') {
      // Not null constraint error
      const message = 'Missing required fields';
      error = { message, statusCode: 400 };
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'Invalid token';
      error = { message, statusCode: 401 };
    }
  
    if (err.name === 'TokenExpiredError') {
      const message = 'Token expired';
      error = { message, statusCode: 401 };
    }
  
    // Validation errors
    if (err.name === 'ValidationError') {
      const message = 'Validation Error';
      error = { message, statusCode: 400 };
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  // Handle 404 routes
  const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  module.exports = { errorHandler, notFound };