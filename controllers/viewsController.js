const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// CONTROLLER FUNCTION TO GET ALERTS
exports.alert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      'Your booking was successful. Please check your email for confirmation.';
  next();
};

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

  if (res.locals.user) {
    const bookings = await Booking.find({
      user: res.locals.user.id,
      tour: tour.id,
    });
    res.locals.isBookedTour = bookings.length > 0;
  }

  // 2) BUILD THE TEMPLATE (IN THE TEMPLATE FILE)

  // 3) RENDER TEMPLATE USING DATA
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
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

// GET THE SIGNUP FORM TEMPLATE
exports.getSignUpForm = (req, res) => {
  res.status(200).render('signUp', {
    title: 'Create a new account',
  });
};

// GET THE USER ACCOUNT PAGE TEMPLATE
exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
});

// HANDLER TO GET BOOKINGS OF A PARTCIULAR USER
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) FIND ALL BOOKINGS
  const bookings = await Booking.find({ user: req.user.id });

  // 2) FIND TOURS WITH THE RETURNED IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

// CONTROLLER FUNCTION TO HANDLE USER UPDATE
exports.updateUserData = catchAsync(async (req, res, next) => {
  console.log('Update', req.body);
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

exports.getMyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ user: req.user.id })
    .select('-user')
    .populate('tour');
  res.status(200).render('review', {
    title: 'My Reviews',
    reviews,
  });
});

exports.getFavorites = catchAsync(async (req, res, next) => {
  const favoriteTours = await User.findById(req.user.id).select('favorite');
  res.status(200).render('overview', {
    title: 'My Favorites',
    tours: favoriteTours.favorite,
  });
});
