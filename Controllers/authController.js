const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

require("../Models/userListModel");
require("../Models/adminModel");
require("../Models/basicAdminModel");
require("../Models/employeeModel");
require("../Models/memberModel");

const jwt = require("jsonwebtoken");

const userListSchema = mongoose.model("userlists");
const adminSchema = mongoose.model("admin");
const basicAdminSchema = mongoose.model("basicAdmins");
const employeeSchema = mongoose.model("employees");
const memberSchema = mongoose.model("members");
const saltRounds = 10;``


exports.login = async (request, response, next) => {
    let data = {};
    let user = null;
    let role = await userListSchema.findOne({email: request.body.email});
    if (!role) {
        let error = new Error("Invalid user credentials");
        error.status = 403;
        next(error);
    }
    let isActivated = false;
    if (role == "admin") {
        user = await adminSchema.findOne({email: request.body.email});
    } else if (role == "basicAdmin") {
        user = await basicAdminSchema.findOne({email: request.body.email});
        data.isRoot=user.isRoot;
    } else if (role == "employee") {
        user = await employeeSchema.findOne({email: request.body.email});
    } else if (role == "member") {
        user = await memberSchema.findOne({email: request.body.email});
    } else {
        let error = new Error("Invalid user credentials");
        error.status = 403;
        next(error);
    }
    data.role = role;
    data.loginId = user._id;
    isActivated = checkIsActivated(user);
    data.isActivated = isActivated;
    let isMatch;
    if (isActivated) {
        console.log(request.body.password);
        console.log(user.password);
            // user.password = bcrypt.hashSync(user.password, saltRounds);
        isMatch = bcrypt.compareSync(request.body.password, user.password);
        if (!isMatch) {
            let error = new Error("Wrong credentials");
            error.status = 403;
            next(error);
        }
    } else {
        isMatch = request.body.password===user.tmpPassword;
        if (!isMatch) {
            let error = new Error("Wrong credentials");
            error.status = 403;
            next(error);
        } 
        else
            data.oldPassword = user.tmpPassword;
    }
    data.email = request.body.email;
    const token = jwt.sign({data},"HelloWorld",{expiresIn: "8h"});
    let newResponse = {data};
    newResponse.token = token;
    response.status(200).json({
        success: true,
        newResponse : newResponse
    });
}

exports.logout = async (request, response, next) => {

    let token = jwt.sign({id: this._id, role: "user"}, "INVALIDLOGOUT", {
        expiresIn: process.env.JWT_EXPIRE,
    });

    response.status(200).json({
        success: true,
        token: token
    });
}

function getToken(data) {
    return jwt.sign({
        data
    }, process.env.SECRET_KEY, { expiresIn: "8h" });
}

const checkIsActivated = (user)=>{
    if(user.tmpPassword)
        return false;
    return true;
}