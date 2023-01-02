const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // ALLOWING NESTED ROUTING FOR TOUR SPECIFIC REVIEW FEATURE
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// CHECK IF THE USER TRYING TO ACCESS THE REVIEW IS THE ADMIN / THE AUTHOR OF THE REVIEW
exports.checkIfAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (req.user.role !== 'admin') {
    if (review.user.id !== req.user.id)
      return next(
        new AppError("You cannot operate on someone else's Review", 403)
      );
    next();
  }
};

// USING FACTORY HANDLER FUNCTIONS FOR THE CRUD OPERATIONS ON THE DATA
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
