const {body,param} = require("express-validator");

exports.loginValidation = [
    body("email").isEmail().withMessage('invalid Email'),
    body("password").isStrongPassword().withMessage("Password must be strong"),
]