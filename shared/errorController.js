// custom error
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  };
};

// actual express error handler
export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(err);

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
    
  } else if (process.env.NODE_ENV === 'production') {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong.'
      });
    };
  };
};