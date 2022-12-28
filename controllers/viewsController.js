const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

// CONTROLLER FUNCTION TO GET THE OVERVIEW PAGE TO VIEW ALL TOURS

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) GET ALL TOUR DATA FROM COLLECTION
  const tours = await Tour.find();

  // 2) BUILD TEMPLATE IN THE TEMPLATE FILE

  // 3) RENDER THE TEMPLATE USING DATA
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

// CONTROLLER FUNCTION TO GET A SINGLE TOUR
exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
  });
};
