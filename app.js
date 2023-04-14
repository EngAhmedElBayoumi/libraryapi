const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const schedule = require('node-schedule');
//start of routes
const adminRouter = require("./Routers/adminRouter");
const basicAdminRouter = require("./Routers/basicAdminRouter");
const bookRouter = require("./Routers/bookRouter");
const employeeRouter = require("./Routers/employeeRouter");
// const loginRouter = require("./Routers/loginRouter");
const memberRouter = require("./Routers/memberRouter");
const transactionRouter = require("./Routers/transactionRouter");
const reportsRouter = require("./Routers/reportsRouters");
// const authenticateMW = require("./Core/Auth/authenticateMW");
const authRoute = require("./Routers/authRoute");
const { dailyRoutine } = require("./Core/Utilities/utilities");
//end of routes
const server = express();
const port = process.env.PORT || 8080;

// Connect to MongoDB
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1:27017/LIBRARY_MANAGEMENT_SYSTEM")
  .then(() => {
    console.log("Database is connected");
    // Run daily routine when server starts, it bans and unbans members from borrowing books
    dailyRoutine();
    // Run daily routine every day at 9AM
    const dailyCheck = schedule.scheduleJob('0 9 * * *', dailyRoutine);
    // Run the server
    server.listen(port, () => {
      console.log("Server is Running...");
    });
  })
  .catch((error) => {
    console.log(`error: ${error}`);
  });

// Logging Middleware
server.use(morgan(":url :method"));

// CORS Middleware
server.use(cors());

// parse-data
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

// Routes
// server.use(loginRouter);
// server.use(authenticateMW);

server.use(adminRouter);
server.use(basicAdminRouter);
server.use(bookRouter)
server.use(memberRouter);
server.use(employeeRouter);
server.use(transactionRouter);
server.use(reportsRouter);

server.use(reportsRouter);

// Not Found Middleware
server.use((request, response) => {
  response.status(404).json({ data: "Route NOT FOUND" });
});

// Error handling Middleware
server.use((error, request, response, next) => {
  let status = error.status || 500;
  response.status(status).json({ message: error + "" });
});
