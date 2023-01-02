const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

// IMPLEMENTING MERGE PARAMETERS TO PROVIDE REVIEW ROUTES TO TOUR ROUTES
const router = express.Router({ mergeParams: true });

// PROTECTING ROUTES AFTER THIS MIDDLEWARE

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    bookingController.checkIfBooked,
    reviewController.createReview
  );

// ROLE SPECIFC RESTRICTED ROUTES

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.checkIfAuthor,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.checkIfAuthor,
    reviewController.deleteReview
  );

module.exports = router;
