const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require("../controllers/bootcamps");

const Bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advanced-results');

// include other resources routers
const courseRouter = require('./courses');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

//re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

//declear routers
router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize('publisher', 'admin') , createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin') , updateBootcamp)
  .delete(protect, authorize('publisher', 'admin') , deleteBootcamp);

module.exports = router;
