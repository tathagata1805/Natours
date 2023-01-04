const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alert);

// HOMEPAGE ROUTE
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get(
  '/signup',
  authController.isLoggedIn,
  viewsController.getSignUpForm,
  authController.signup
);

// INDIVIDUA CONTENT PAGE ROUTE
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm); // LOGIN ROUTE
router.get('/me', authController.protect, viewsController.getAccount); // GETING USER PAGE ROUTE
router.get('/my-tours', authController.protect, viewsController.getMyTours); // GETING USER SPECIFIC TOURS

router.get('/my-reviews', authController.protect, viewsController.getMyReviews);

router.get(
  '/my-favorites',
  authController.protect,
  viewsController.getFavorites
);

// USER DATA UPDATE ROUTE
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
