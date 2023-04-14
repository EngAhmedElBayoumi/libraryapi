const express = require("express");
const validateMW = require("../Core/Validations/validateMW");
const controller = require("../Controllers/adminController");
const adminValidationArrays = require("../Core/Validations/validateAdmin");
const multerMW = require("../Core/Multer/multerMW");
const authMW = require("../Middlewares/authMW");
const router = express.Router();
const { checkEmail } = require("../Core/Utilities/utilities");

router
	.all(authMW.authorizeUser("basicAdmin"), authMW.isActive)
	.route("/admins")
	.get(controller.allAdmins)
	.post(
		multerMW,
		checkEmail,
		adminValidationArrays.validatePostArray,
		validateMW.validateImageMW,
		controller.insertAdmin
	)
	.patch(
		multerMW,
		checkEmail,
		adminValidationArrays.validatePatchArrayAdmin,
		validateMW.validateImageMW,
		controller.updateAdmin
	)
	.delete(
		multerMW,
		adminValidationArrays.validateId,
		validateMW,
		controller.deleteAdmin
	);

router
	.route("/admin/:id")
	.all(authMW.authorizeUser("admin"), authMW.sameUser, authMW.isActive)
	.get(
		adminValidationArrays.validateIdParam,
		validateMW,
		controller.getOneAdmin
	)
	.patch(
		multerMW,
		adminValidationArrays.validatePatchArrayAdminTwo,
		validateMW.validateImageMW,
		controller.updateAdminById
	);

router
	.route("/admin/activate/:id")
	.all(authMW.authorizeUser("admin"), authMW.sameUser)
	.patch(
		multerMW,
		adminValidationArrays.activationArrayValidation,
		validateMW.validateImageMW,
		controller.activateAdmin
	);

module.exports = router;
