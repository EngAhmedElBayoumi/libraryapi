const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

require("../Models/userListModel");
require("./../Models/adminModel");
require("./../Models/basicAdminModel");
require("./../Models/employeeModel");
require("./../Models/memberModel");

const userListSchema = mongoose.model("userlists");
const adminSchema = mongoose.model("admin");
const basicAdminSchema = mongoose.model("basicAdmins");
const employeeSchema = mongoose.model("employees");
const memberSchema = mongoose.model("members");

module.exports = (request, response, next) => {
    if(!request.get("authorization"))
        notAuthorized(next,"please Login first");
    else{
        const token = request.get("authorization").split(" ")[1];
        const decodedToken = jwt.verify(token,"HelloWorld");
        const role = decodedToken.data.role;
        const loginId = decodedToken.data.loginId;

            if (role === 'admin') {
                request.user = adminSchema.findById(loginId)
            } else if (role === 'basicAdmin') {
                request.user = basicAdminSchema.findById(loginId)
            }else if (role === 'employee') {
                request.user = employeeSchema.findById(loginId)
            } else if(role === 'member') {
                request.user = memberSchema.findById(loginId)
            }
            else{
                notAuthorized(next);
            }
        next();
    }
}

module.exports.sameUser = (request,response,next)=>{
    if(!request.get("authorization"))
        notAuthorized(next,"please Login first");
    else{
        const token = request.get("authorization").split(" ")[1];
        const decodedToken = jwt.verify(token,"HelloWorld");
        const role = decodedToken.data.role;
        const loginId = decodedToken.data.loginId;
        if(loginId==request.params.id)
            next();
        else
            notAuthorized(next);
    }
}

module.exports.authorizeUser = (...roles) => {
    return (request, response, next) => {
        if(!request.get("authorization"))
        notAuthorized(next,"please Login first");
        else{
            const token = request.get("authorization").split(" ")[1];
            const decodedToken = jwt.verify(token,"HelloWorld");
            const role = decodedToken.data.role;
            const loginId = decodedToken.data.loginId;
            if (!roles.includes(role)) {
                return next(new Error('Sorry, You are not authorized on this route.', 403));
            }
            next();
        }
    }
}


//check if basic admin is root
module.exports.isRoot=(request,response,next)=>{
    if(!request.get("authorization"))
        notAuthorized(next,"please Login first");
    else{
        const token = request.get("authorization").split(" ")[1];
        const decodedToken = jwt.verify(token,"HelloWorld");
        const role = decodedToken.data.role;
        const loginId = decodedToken.data.loginId;
        if(decodedToken.data.isRoot)
            next();
        else
        notAuthorized(next,"Basic admin is not root");
    }
}

//check if user password is active
//not done
module.exports.isActive = (request,response,next)=>{
    if(!request.get("authorization"))
    notAuthorized(next,"please Login first");
    else{
        const token = request.get("authorization").split(" ")[1];
        const decodedToken = jwt.verify(token,"HelloWorld");
        const role = decodedToken.data.role;
        const loginId = decodedToken.data.loginId;
        if(decodedToken.data.isActivated)
            next();
        else
        notAuthorized(next,"User not Activated");
    }
}

    const notAuthorized= (next,message="Not Authorized")=>{
        let error = new Error(message);
        error.status = 403;
        next(error);
    }