const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');
const fileupload = require('express-fileupload')
const conn = require('./config/db');
const errorHandler = require('./middleware/error');
// const logger = require('./middleware/logger');

// //my logger
// app.use(logger);

//load env vars
dotenv.config({ path: "./config/config.env" });

//connect to database
conn();


//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();

//body parser
app.use(express.json());

// Dev logging middleware using custom logger
if(process.env.NODE_ENV === "development "){
  app.use(morgan('dev'));
}

//file uploading
app.use(fileupload)

//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// hanle unhandled promise rejections
process.on('unhandledRejection', (err, promiss) => {
  console.log( `Error: ${err.message}` );
  //Close server and exit process
  server.close(() => process.exit(1));
})