const { body, param } = require("express-validator");

exports.validatePostArray = [
    body("firstName").isAlpha().withMessage("First name must be alphabetic"),
    body("lastName").isAlpha().withMessage("Last name must be alphabetic"),
    body("email").isEmail().withMessage("Email is not valid"),
    body("gender").optional().isIn(["male", "female"]).withMessage("Gender must be either male or female"),
    body("birthDate").optional().isDate().withMessage("Birth date must be a valid date"),
    body("address").optional().isObject().withMessage("Address must be an object"),
];

exports.validatePatchArrayMemberByAdmin = [
  body("firstName").optional().isAlpha().withMessage("First name must be alphabetic"),
  body("lastName").optional().isAlpha().withMessage("Last name must be alphabetic"),
  body("email").optional().isEmail().withMessage("invalid email"),
  body("password").optional().isStrongPassword().withMessage("Password must be strong"),
  body("gender").optional().isIn(["male", "female"]).withMessage("Gender must be either male or female"),
  body("birthDate").optional().isDate().withMessage("Birth date must be a valid date"),
  body("address").optional().isObject().withMessage("Address must be an object"),
  body("image").optional().isString().withMessage("Image must be a string")
];

exports.validatePatchArrayMember = [
  body("firstName").optional().isAlpha().withMessage("First name must be alphabetic"),
  body("lastName").optional().isAlpha().withMessage("Last name must be alphabetic"),
  body("password").optional().isStrongPassword().withMessage("Password must be strong"),
  body("gender").optional().isIn(["male", "female"]).withMessage("Gender must be either male or female"),
  body("birthDate").optional().isDate().withMessage("Birth date must be a valid date"),
  body("address").optional().isObject().withMessage("Address must be an object"),
  body("image").optional().isString().withMessage("Image must be a string")
];

exports.validatePatchArrayMemberAcive = [
  body("firstName").optional().isAlpha().withMessage("First name must be alphabetic"),
  body("lastName").optional().isAlpha().withMessage("Last name must be alphabetic"),
  // body("newpassword").isStrongPassword().withMessage("Password must be strong"),
  body("gender").optional().isIn(["male", "female"]).withMessage("Gender must be either male or female"),
  body("birthDate").optional().isDate().withMessage("Birth date must be a valid date"),
  body("address").optional().isObject().withMessage("Address must be an object"),
  body("image").optional().isString().withMessage("Image must be a string")
];

exports.validateIdParam = [
  param("id").isNumeric().withMessage("Member id should be number"),
];

exports.validateIdBody = [
  body("id").isNumeric().withMessage("Member id should be number"),
]

exports.validateEmailParam = [
  param("email").isEmail().withMessage("Email is not valid"),
];

exports.validateNameParam = [
  param("firstName").isAlpha().withMessage("First name must be alphabetic"),
  param("lastName").isAlpha().withMessage("Last name must be alphabetic"),
];

// TODO: isString() For Address , While it is an Object  ; 
