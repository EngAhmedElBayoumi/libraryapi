const express = require('express');
const authController = require("../Controllers/authController");
const router = express.Router();
const authMW = require("./../Middlewares/authMW");

const Validator = require('../Core/Validations/authValidator');

router.route('/login').post(
    // Validator.loginValidation,
    authController.login
    );
router.route('/logout').post( authMW, authController.logout);

module.exports = router;