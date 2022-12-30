const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// HOMEPAGE ROUTE
router.get('/', authController.isLoggedIn, viewsController.getOverview);

// INDIVIDUA CONTENT PAGE ROUTE
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm); // LOGIN ROUTE
router.get('/me', authController.protect, viewsController.getAccount); // GETING USER PAGE ROUTE

// USER DATA UPDATE ROUTE
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
