const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// MIDDLEWARES FOR PROTECTING ROUTES AND ROLE BASED AUTHORIZATION
router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

// USER SPECIFIC ROUTES
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

// INDIVIDUAL USER ROUTES
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
