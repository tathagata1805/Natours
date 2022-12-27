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
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// ERROR FOR PRODUCTION ENVIRONMENT
const sendErrorProd = (err, res) => {
  // OPERATINAL AND TRUSTED ERROR: SEND MESSAGE TO CLIENT IN PRODUCTION
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // PROGRAMMING OR UNKNOWN ERROR: DON'T LEAK ERROR DETAILS TO CLIENT IN PRODUUCTION
  } else {
    // 1) LOG ERROR
    console.error('ERROR 💥', err);

    // 2) SEND GENERIC MESSAGE
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // DECLARING ERROR HANDLERS...
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
