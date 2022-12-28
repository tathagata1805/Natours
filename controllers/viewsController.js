const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// CONTROLLER FUNCTION TO GET THE OVERVIEW PAGE TO VIEW ALL TOURS

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) GET ALL TOUR DATA FROM COLLECTION
  const tours = await Tour.find();

  // 2) BUILD TEMPLATE (IN THE TEMPLATE FILE)

  // 3) RENDER THE TEMPLATE USING DATA
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

// CONTROLLER FUNCTION TO GET A SINGLE TOUR
exports.getTour = catchAsync(async (req, res, next) => {
  // GET THE DATA FOR THE REQUESTED TOUR (INCLUDING REVIEWS AND GUIDES)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // IF NO TOUR, SHOW ERROR
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) BUILD THE TEMPLATE (IN THE TEMPLATE FILE)

  // 3) RENDER TEMPLATE USING DATA
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

// GET THE LOGIN FORM TEMPLATE
exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login into your Account',
  });
});

// GET THE USER ACCOUNT PAGE TEMPLATE
exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
});

// CONTROLLER FUNCTION TO HANDLE USER UPDATE
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.user.name,
      email: req.user.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
