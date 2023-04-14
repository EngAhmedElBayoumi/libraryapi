
const { body,param } = require('express-validator');

module.exports.addBasicAdmin= [
    body('firstName').isAlpha().withMessage('First name must be alphabetic'),
    body('lastName').isAlpha().withMessage('Last name must be alphabetic'),
    body('email').isEmail().withMessage('Invalid email'),
    body("gender").optional().isIn(["male", "female"]).withMessage("Invalid gender"),
    body('birthDate').optional().isDate().withMessage('put your birth date'),
    body('salary').optional().isNumeric().withMessage('Invalid salary'),
];
module.exports.updateBasicAdmin = [
    body('basicAdminId').isNumeric().withMessage("Invalid id"),
    body('firstName').optional().isAlpha().withMessage('Wrong FirstName'),
    body('lastName').optional().isAlpha().withMessage('Wrong LastName'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body("gender").optional().isIn(["male", "female"]).withMessage("Invalid gender"),
    body('password').optional().isStrongPassword().withMessage('Password must be strong'),
    body('birthDate').optional().isDate().withMessage('Invalid date put your date'),
    body('salary').optional().isNumeric().withMessage('Invalid salary'),
];

exports.updateBasicAdminArray = [
    param("id").isNumeric().withMessage("Id must be a number"),
    body("firstName").optional().isAlpha().withMessage("First name must be alphabetic"),
    body("lastName").optional().isAlpha().withMessage("Last name must be alphabetic"),
    body("password").optional().isStrongPassword().withMessage("Password must be strong"),
    body("birthDate").optional().isDate().withMessage("Birth date must be a valid date")
];

exports.updateBasicAdminActivate = [
    param("id").isNumeric().withMessage("Id must be a number"),
    body("firstName").isAlpha().withMessage("First name must be alphabetic"),
    body("lastName").isAlpha().withMessage("Last name must be alphabetic"),
    body("oldPassword").isStrongPassword().withMessage("Old password must be provided"),
    body("newPassword").isStrongPassword().withMessage("New password must be strong"),
    body("birthDate").isDate().withMessage("Birth date must be a valid date")
  ];

exports.validateBasicAdminId = [
    body("id").isNumeric().withMessage("Basic admin id should be number"),
  ];

exports.validateBasicAdminIdParam = [
param("id").isNumeric().withMessage("Employee id should be number"),
];