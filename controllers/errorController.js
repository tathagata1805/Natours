// ERROR HANDLERS -> MICROSERVICES

const AppError = require('./../utils/appError');

// HANDLING CASTING ERROR IN DATABASE
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// HANDLING DUPLICATE FIELDS ERROR IN THE DATABASE
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// HANDLING DATA VALIDATION ERROR IN THE DATABASE
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// HANDLING JWT ERROR
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

// HANDLING JWT EXPIRY ERROR
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// ENVIRONMENT SPECIFIIC ERROR HANDLING

// ERROR FOR DEVELOPMENT ENVIRONMENT
const sendErrorDev = (err, req, res) => {
  // FOR API CALLS
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED TEMPLATE IN CLIENT SIDE
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

// ERROR FOR PRODUCTION ENVIRONMENT
const sendErrorProd = (err, req, res) => {
  // A) API CALLS
  if (req.originalUrl.startsWith('/api')) {
    // A) OPERATIONAL, TRUSTED ERROR: SEND DETAILS TO CLIENT
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) PROGRAMMING ERROR:- DON'T LEAK DETAILS TO CLIENTS
    // 1) LOG THE ERROR
    console.error('ERROR 💥', err);
    // 2) SEND GENERIC MESSAGE
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // A) OPERATIONAL, TRUSTED ERROR: SEND DETAILS TO CLIENT
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) PROGRAMMING ERROR:- DON'T LEAK DETAILS TO CLIENTS
  // 1) LOG THE ERROR
  console.error('ERROR 💥', err);
  // 2) SEND GENERIC MESSAGE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  // DECLARING ERROR HANDLERS...
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
