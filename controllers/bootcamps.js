const ErrorResponse = require("../utils/errorResponse");
const asyncHander = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHander(async (req, res, next) => {
  let query;

  //copy req.query
  const reqQuery = {...req.query};

  //fields to exclude
  const removeFields = ['select, sort'];

  //loop over removed fields and delete them from reqQuery
  removeFields.forEach(param => {
    delete reqQuery[param]
    console.log(reqQuery)
  });

  //create query string
  let queryString = JSON.stringify(reqQuery);

  //creating operator in form $gt, $gte
  queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  //finding resource
  query = Bootcamp.find(JSON.parse(queryString));

  console.log(reqQuery)
console.log(req.query)

  //select fields
  if(req.query.select){
    const fields = req.query.select.split(",").join(' ');
    query= query.select('name description');
  }

  //sortby fields
  if(req.query.sort){
    const sortBy = req.query.sort.split(",").join(' ');
    query = query.sort(sortBy);

  }else{
    query = query.sort('-name')
  }

  // const bootcamps = await Bootcamp.find();
  const bootcamps = await query;

  console.log(bootcamps)

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Private
exports.getBootcamp = asyncHander(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBootcamp = asyncHander(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHander(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHander(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: []
  });
});

// @desc        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHander(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/log from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //cal radius using radians by dividing dist by radius of the earth
  // Earth's radius is 3.963 mils, 6378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
