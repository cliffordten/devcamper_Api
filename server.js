const express = require("express");
const dotenv = require("dotenv");

//route files
const bootcamps = require('./routes/bootcamps')

data = {
  name: "clifford",
  age: 17
};

//load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();

const logger = (req, res, next) => {
  req.hello = "hello world";
  console.log(`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`);
  next();
}

app.use(logger);

//mount routers
app.use('/api/v1/bootcamps', bootcamps, (req, res, next) => {
  
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
