//import mongoose
const mongoose = require("mongoose");
//import auto increment
const autoIncrement = require('mongoose-sequence')(mongoose);
//import book schema
// const bookSchema = require("./bookModel");
//import employee schema
// const employeeSchema = require("./employeeModel");
//import member schema
// const memberSchema = require("./memberModel");
//create transactionSchema
const transactionSchema = new mongoose.Schema({
    _id: Number,
    bookId: {
        type: Number,
        ref: "books",
        required: true
    },
    memberId: {
        type: Number,
        ref: "members",
        required: true
    },
    employeeId: {
        type: Number,
        ref: "employees",
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["borrow", "read"],
        required: true
    },
    isReturned:{
        type:Boolean,
        default:false
    }
}, { _id: false });

// Add auto increment plugin
transactionSchema.plugin(autoIncrement, { id: 'transactionId', inc_field: '_id' });

//create transaction model
mongoose.model("transactions", transactionSchema);
