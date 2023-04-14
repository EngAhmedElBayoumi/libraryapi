
const express=require("express");
//controllers
const controller=require("../Controllers/basicAdminController");
//validate
const {body,param,query}=require("express-validator");
const validateMW=require("./../Core/Validations/validateMW");
const basicAdminValidate = require("./../Core/Validations/validateBasicAdmin");
//route
const router=express.Router();
// use multer
const multerMW = require("../Core/Multer/multerMW");
const { checkEmail } = require("../Core/Utilities/utilities");
const authMW = require("../Middlewares/authMW"); 


// basicAdmin
router.route("/basicadmin")
.all(authMW.authorizeUser("basicAdmin"), authMW.isActive, authMW.isRoot)
.get(validateMW,controller.getAllBasicAdmin)
.post(multerMW,checkEmail,basicAdminValidate.addBasicAdmin,validateMW.validateImageMW,controller.addBasicAdmin)
.patch(multerMW,checkEmail,basicAdminValidate.updateBasicAdmin,validateMW.validateImageMW,controller.updateBasicAdminByBasicAdmin)
.delete(multerMW,basicAdminValidate.validateBasicAdminId,validateMW,controller.deleteBasicAdmin);

router.route("/basicadmin/:id")
.all(authMW.authorizeUser("basicAdmin"),authMW.sameUser, authMW.isActive)
.get(basicAdminValidate.validateBasicAdminIdParam,multerMW,validateMW,controller.getOneBasicAdmin)
.patch(basicAdminValidate.updateBasicAdminArray,multerMW,validateMW.validateImageMW,controller.updateBasicAdminById);

router.route("/basicadmin/activate/:id")
.all(authMW.authorizeUser("basicAdmin"),authMW.sameUser)
.patch(multerMW,basicAdminValidate.updateBasicAdminActivate,validateMW.validateImageMW,controller.activateBasicAdmin);

module.exports=router;




