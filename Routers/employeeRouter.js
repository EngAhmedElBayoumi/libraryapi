const { checkEmail } = require("../Core/Utilities/utilities");
const express = require("express");
const validateMW = require("../Core/Validations/validateMW");
const controller = require("../Controllers/employeeController");
const validateEmployee = require("../Core/Validations/validateEmployee");
const authMW = require("../Middlewares/authMW"); 
const multerMW = require("../Core/Multer/multerMW");

const router = express.Router();

router
  .route("/employees")
  .get(controller.getEmployees)
  .post(
    multerMW,
    checkEmail,
    validateEmployee.validatePostArray,
    validateMW.validateImageMW,
    controller.addEmployee
  )
  .patch(
    multerMW,
    checkEmail,
    validateEmployee.validatePatchArrayAdmin,
    validateMW.validateImageMW,
    controller.updateEmployeeByAdmin
  )
  .delete(
    multerMW,
    validateEmployee.validateId,
    validateMW,
    controller.deleteEmployee
  );

router
  .route("/employees/:id")
  .all(authMW.authorizeUser("employee"), authMW.sameUser, authMW.isActive)
  .get(
    validateEmployee.validateIdParam,
    validateMW,
    controller.getEmployeeById
  )
  .patch(
    multerMW,
    validateEmployee.validatePatchArrayEmployee,
    validateMW.validateImageMW,
    controller.updateEmployeeById
  )

router
  .route("/employees/activate/:id")
  .all(authMW.authorizeUser("employee"), authMW.sameUser)
  .patch(
    multerMW,
    validateEmployee.validatePatchArrayActivate,
    validateMW.validateImageMW,
    controller.activateEmployee
  )
module.exports = router;
