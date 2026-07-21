/**
 * Centralized Error Handling Middleware:
 * Intercepts any unhandled errors, logs the full details server-side for developers,
 * and returns a clean, helpful error response to the client.
 * 
 * Hides internal stack traces in production to prevent technical information leaks.
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error to console or error-tracking services (e.g. Sentry)
  console.error(`[Server Error] ${err.stack || err.message}`);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * 404 Route Handler Middleware:
 * Catches any requests made to routes/endpoints that do not exist.
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - Requested Endpoint [${req.method}] ${req.originalUrl} does not exist.`);
  res.status(404);
  next(error);
};
