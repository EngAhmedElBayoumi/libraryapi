const { checkEmail } = require("../Core/Utilities/utilities");
const express = require("express");
const validateMW = require("../Core/Validations/validateMW");
const controller = require("../Controllers/memberController");
const validateMember = require("../Core/Validations/validateMember");
const multerMW = require("../Core/Multer/multerMW");
const authenticationMW = require("../Middlewares/authMW"); 
const router = express.Router();

//get all member and add member
router.route("/members")
    .get(controller.getAllMembers)
    .post(multerMW,
        checkEmail,
        validateMember.validatePostArray,
        validateMW.validateImageMW,
        controller.addMember
        )
    .patch(
        multerMW,
        // checkEmail,
        validateMember.validatePatchArrayMember,
        validateMW.validateImageMW,
        controller.updateMemberByAdmin
    )
    .delete(
        multerMW,
        validateMember.validateIdBody,
        validateMW,
        controller.deleteMember
    );

//get member by id, update member and delete member
router.route("/members/:id")
    .all(authenticationMW.authorizeUser("member"),authenticationMW.sameUser, authenticationMW.isActive)
    .get(
        validateMember.validateIdParam,
        validateMW,
        controller.getMemberById)
    .patch(
        multerMW,
        validateMember.validateIdParam,
        validateMember.validatePatchArrayMember,
        validateMW.validateImageMW,
        controller.updateMemberById
        )

//get member by email
router.route("/members/email/:email")
    .all(authenticationMW.authorizeUser("admin","basicAdmin","employee"), authenticationMW.isActive)
    .get(
        validateMember.validateEmailParam,
        validateMW,
        controller.getMemberByEmail);

//get member by firstName+lastName
router.route("/members/name/:firstName/:lastName")
    .all(authenticationMW.authorizeUser("admin","basicAdmin","employee"), authenticationMW.isActive)
    .get(
        validateMember.validateNameParam,
        validateMW,
        controller.getMemberByName);

router.route("/members/activate/:id")
    .all(authenticationMW.authorizeUser("member"),authenticationMW.sameUser)
    .patch(
        multerMW,
        validateMember.validatePatchArrayMemberAcive,
        validateMW.validateImageMW,
        controller.activateMember
    )

module.exports = router;