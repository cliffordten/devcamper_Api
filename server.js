const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');
const conn = require('./config/db');
// const logger = require('./middleware/logger');

// //my logger
// app.use(logger);

//load env vars
dotenv.config({ path: "./config/config.env" });

//connect to database
conn();


//route files
const bootcamps = require('./routes/bootcamps')

data = {
  name: "clifford",
  age: 17
};

const app = express();

// Dev logging middleware using custom logger
if(process.env.NODE_ENV === "development "){
  app.use(morgan('dev'));
}

//mount routers
app.use('/api/v1/bootcamps', bootcamps, (req, res, next) => {
  
});

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