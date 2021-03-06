const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHander = require("../middleware/async");
const User = require("../models/User");

// @desc        Register Users
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHander(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //Create User
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

// @desc        Login Users
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHander(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide and email and a password", 400)
    );
  }

  //check for the user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //check if password  matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc        Get current logged-in user
// @route       POST /api/v1/auth/me
// @access      Private
exports.getMe = asyncHander(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc        Forgot password
// @route       POST /api/v1/auth/forgotpassword
// @access      Public 
exports.forgotPassword = asyncHander(async (req, res, next) => {
  const user = await User.findOne({email: req.body.email});

  if(!user){
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  //get reset token
  const resetToken = getResetPasswordToken();

  await user.save({validateBeforeSave: false})

  res.status(200).json({
    success: true,
    data: user
  });
});


//get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Creat token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 3600 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
