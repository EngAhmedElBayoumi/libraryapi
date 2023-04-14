const express = require("express");
const reportController = require("../Controllers/reportController");
const reportsRouter = express.Router();
const authMW = require('./../Middlewares/authMW');

// Books Model
reportsRouter.route("/report/general1")
    .get(
        authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive,
        reportController.generalReport1);
reportsRouter.route("/report/general")
    .get(
        authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive,
        reportController.generateReport);
reportsRouter.route("/report/monthly")
    .get(
        authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive,
        reportController.currentMonthReading);
reportsRouter.route("/report/yearly")
    .get(
        authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive,
        reportController.currentYearReading);

// Export in the Last Step
module.exports = reportsRouter;
