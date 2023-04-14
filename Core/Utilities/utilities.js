const mongoose = require("mongoose");
const fs = require("fs");
const { request } = require("http");
const { response } = require("express");
require("../../Models/basicAdminModel");
require("../../Models/adminModel");
require("../../Models/employeeModel");
require("../../Models/memberModel");
require("../../Models/transactionModel");
require("../../Models/userListModel");
// TODO request and Response imports above are REDUNDANT 
const BasicAdminSchema = mongoose.model("basicAdmins");
const AdminSchema = mongoose.model("admin");
const EmployeeSchema = mongoose.model("employees");
const MemberSchema = mongoose.model("members");
const TransactionSchema = mongoose.model("transactions");
const UserListSchema = mongoose.model("userlists");

exports.toCapitalCase = (str) =>
    str.split("/")[1].charAt(0).toUpperCase() +
    str.split("/")[1].substring(1, str.length - 1);

exports.generatePassword = length => {
    let password = '', charCode;
    let preventChars = [34, 39, 92, 96]; // exclude backslash, backtick, single and double quotes
    for (let char = 0; char < 4; char++) {
        if (char % 4 == 0) {
            charCode = Math.floor(Math.random() * 10 + 48);
        } // include numbers
        else if (char % 4 == 1) {
            charCode = Math.floor(Math.random() * 26 + 65);
        } // include capital letters
        else if (char % 4 == 2) {
            charCode = Math.floor(Math.random() * 26 + 97);
        } // include small letters
        else {
            charCode =  Math.floor(Math.random() * 15 + 33) ||
                        Math.floor(Math.random() * 7  + 58) ||
                        Math.floor(Math.random() * 6  + 91) ||
                        Math.floor(Math.random() * 4 + 123);
        } // include special characters
        if (!preventChars.includes(charCode)) {
            password += String.fromCharCode(charCode);
        }
    }
    while (password.length < length) {
        charCode =  Math.floor(Math.random() * 59 + 33) ||
                    Math.floor(Math.random() * 34 + 93);
        if (!preventChars.includes(charCode)) {
            password += String.fromCharCode(charCode);
        }
    }
    return password;
}

let invalidEmail = (imagePath) => {
    if (imagePath !== null) {
        fs.unlink(imagePath, (error) => {
            return;
        });
        throw new Error("Email already exists");
    }
}

exports.checkEmail = (request, response, next) => {
    const imagePath = request.file === undefined ? null : request.file.path;
    BasicAdminSchema.find({ email: request.body.email })
    .then((data) => {
        if (data.length > 0) {
            invalidEmail(imagePath);
        }
        else
            return AdminSchema.find({ email: request.body.email });
    })
    .then((data) => {
        if (data.length > 0) {
            invalidEmail(imagePath);
        }
        else
            return EmployeeSchema.find({ email: request.body.email });
    })
    .then((data) => {
        if (data.length > 0) {
            invalidEmail(imagePath);
        }
        else
            return MemberSchema.find({ email: request.body.email });
    })
    .then((data) => {
        if (data.length > 0) {
            invalidEmail(imagePath);
        }
        else
            next();
    })
    .catch((error) => {
        next(error);
    })
}

// Ban members who didn't return borrowed books before endDate
async function BanMembers() {
    const today = new Date();
    const transactions = await TransactionSchema.find({ endDate: { $lt: today }, isReturned: false });
  
    for (const transaction of transactions) {
        const member = await MemberSchema.findOne({ _id: transaction.memberId });
        member.isBanned = true;
        await member.save();
    }
};

// Unban members who returned borrowed books after one week from return date
async function UnbanMembers() {
    const today = new Date();
    const membersToUnban = await MemberSchema.find({ preventBorrowUntil: { $lt: today } });
    for (const member of membersToUnban) {
        member.isBanned = false;
        member.preventBorrowUntil = null;
        await member.save();
    }
};

exports.dailyRoutine = async () => {
    await BanMembers();
    await UnbanMembers();
}

// check request.body.email exist in userListModel
exports.checkEmailList=(request,response,next)=>{
    UserListSchema.findOne({email:request.body.email})
    .then((data)=>{
        if(data!==null){
            throw new Error("Email already exists");
        }
        else{
            next();
        }
    }
    )
}

// delete email from userListModel
exports.deleteEmailList=(request,response,next)=>{
    UserListSchema.findOneAndDelete({email:request.body.email})
    .then((data)=>{
        next();
    }
    )
    .catch((error)=>{
        next(error);
    }
    )
}

// update email in userlistmodel
exports.updateEmailList=(request,response,next)=>{
    UserListSchema.findOneAndUpdate({email:request.body.email})
    .then((data)=>{
        next();
    }
    )
    .catch((error)=>{
        next(error);
    }
    )
}
