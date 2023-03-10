const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

// CREATE JWT TOKEN SIGNATURE WITH THREE PARAMETERS:-
//* 1) ID OF THE USER, 2) SECRET CODE 3) CALLBACK FOR EMBEDDING EXPIRY IN THE SIGNATURE *//

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// FACTORY FUNCTION FOR SENDING TOKEN TO THE CLIENT AS COOKIES
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // REMOVE PASSWORD FROM API OUTPUT
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// SINGUP USER
exports.signup = catchAsync(async (req, res, next) => {
  const token = await crypto.randomBytes(32).toString('hex');
  const verifyEmailToken = await crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // VERIFYING TOKEN BEFORE SENDING THE MAIL
  const verifyEmailTokenExpires = Date.now() + 10 * 60 * 1000;
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    verifyEmailToken,
    verifyEmailTokenExpires,
  });

  // SENDING WELCOME MAIL TO THE USER
  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verifyEmail/${token}`;

  await new Email(newUser, url).sendVerifyEmail();

  res.status(201).json({
    status: 'success',
    data: {},
  });
});

// FEATURE OF VERIFYING THE USER BEFORE LOGGING IN USING EMAIL
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = await crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // CREATING NEW USER BASED ON TOKEN VERIFIED ABOVE..
  const newUser = await User.findOne({
    verifyEmailToken: hashedToken,
    verifyEmailTokenExpires: { $gt: Date.now() },
  });

  if (!newUser)
    return next(new AppError('Token is invalid or has expired', 400));
  const url = `${req.protocol}://${req.get('host')}/me`;

  // ONCE VERIFIED AND NO ERRORS, NEW USER CREATED AND WELCOME MAIL SENT
  newUser.emailVerified = true;
  newUser.verifyEmailToken = undefined;
  newUser.verifyEmailTokenExpires = undefined;
  await newUser.save({ validateBeforeSave: false });
  await new Email(newUser, url).sendWelcome();

  res.status(201).render('verified', {
    title: 'Email verified Successfully',
  });
});

// LOGGING IN THE USER
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({
    email,
  }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // VERIFY MAIL
  if (!user.emailVerified) {
    return next(new AppError('Please First verify your email address!', 401));
  }

  createSendToken(user, 200, req, res);
});

// PROTECTING ROUTES USING ROLE BASED AUTHORIZATION FEATURE
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    if (!req.headers['user-agent'].includes('PostmanRuntime'))
      return res.status(401).json({
        status: 'error',
        message: 'Please Login to perform this action!',
      });
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // DECODING JWT TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not longer exists.',
        401
      )
    );
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }
  res.locals.user = currentUser;
  req.user = currentUser;
  next();
});

// CHECKING WHETHER USER IS LOGGED IN OR NOT (WON'T GENERATE ANY ERROR)
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      if (!currentUser.emailVerified) {
        return next(
          new AppError('Please First verify your email address!', 401)
        );
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// HANDLER TO HANDLE LOGOUT
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

// RESTRICTING ACCESS FEATURE
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

// FORGOT PASSWORD FEATURE FLOW
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  // CHECKING USER
  if (!user) {
    return next(new AppError('There is no user with that email address!', 404));
  }

  // VERIFYING MAIL
  if (!user.emailVerified) {
    return next(new AppError('Please First verify your email address!', 401));
  }

  // RESETTING TOKEN
  const resetToken = user.createPasswordResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  // SEDNING MAIL
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false,
    });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token send to email!',
  });
});

// RESET PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // NEW TOKEN FOR NEW PASSWORD
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // SAVING USER WITH NEW TOKEN AND PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});

// UPDATING PASSWORD
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, req, res);
});
