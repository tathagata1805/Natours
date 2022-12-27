const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// HANDLER FUNCTION FOR FILTERING OUT UNWANTED FIELDS FROM THE RESPONSE
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// GET CURRENT "LOGGED IN" USER FEATURE
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

// UPDATING CURRENT USER FEATURE
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) CREATE ERROR IF USER TRIES TO UPDATE PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use the proper route to perform this action.',
        400
      )
    );
  }

  // 2) FILTERING OUT UNWANTED FIELD NAMES THAT ARE NOT ALLOWED TO BE UPDATED
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) UPDATE USER DOCUMENT
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// DELETE CURRENT USER FEATURE
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// CREATE AN USER FEATURE
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// IMPLEMENTING FACTORY FUNCTIONS
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
