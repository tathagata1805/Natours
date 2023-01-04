const User = require('./../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// MULTER CONFIGURATION FOR PHOTO UPLOADING

// MULTER STORAGE:- TO STORE IMAGE AS BUFFER IN MEMORY
const multerStorage = multer.memoryStorage();

// MULTER FILTER:- FILTERING IMAGES BEFORE FINAL UPLOAD
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// UPLOADING USER PHOTO
exports.uploadUserPhoto = upload.single('photo');

// IMAGE RESIZING FEATURE
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // SHARP CONFIG FOR IMAGE PROCESSING
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  if (req.file) filteredBody.photo = req.file.filename;

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

exports.addFavorite = catchAsync(async (req, res, next) => {
  req.user.addFavorite(req.params.tourId);
  await req.user.save({ validateBeforeSave: false });
  res.status(201).json({
    status: 'success',
    data: {},
  });
});

exports.removeFavorite = catchAsync(async (req, res, next) => {
  req.user.removeFavorite(req.params.tourId);
  await req.user.save({ validateBeforeSave: false });
  res.status(204).json({
    status: 'success',
    data: {},
  });
});

exports.favorites = catchAsync(async (req, res, next) => {
  const favorites = await User.findById(req.user.id).select('favorite');
  res.status(200).json({
    status: 'success',
    data: {
      favorites,
    },
  });
});
