const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
// const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) GET THE CURRENTLY BOOKED TOUR
  const tour = await Tour.findById(req.params.tourId);

  // 2) CREATE CHECKOUT SESSION
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });

  // 3) CREATE SESSION AS RESPONSE
  res.status(200).json({
    status: 'success',
    session,
  });
});

// CREATING BOOKING CHECKOUT FUNCTION
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

// CHECK IF THE USER HAS PURCHASED THE TOUR BEFORE ALLOWING IT TO WRITE A REVIEW
exports.checkIfBooked = catchAsync(async (req, res, next) => {
  // 1) TO CHECK IF THE TOUR WAS BOOKED BY THE USER WHO WANTS TO REVIEW IT
  const booking = await Booking.find({
    user: req.user.id,
    tour: req.body.tour,
  });

  if (booking.length === 0)
    return next(new AppError('You must buy this Tour to Review it', 401));
  next();
});

// HANDLING BOOKING FEATURES USING FACTORY FUNCTION HANDLERS
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
