//import mongoose
const mongoose = require("mongoose");
//import auto increment
const autoIncrement = require('mongoose-sequence')(mongoose);
//create userlist model that contain ref to member , employee , admin , basic admin
const userlistSchema = new mongoose.Schema({
    _id: Number,
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        enum:["member","employee","admin","basic admin"],
        required:true
    },
}, { _id: false });

// Add auto increment plugin
userlistSchema.plugin(autoIncrement, { id: 'userlistId', inc_field: '_id' });

//create userlist model
mongoose.model("userlists", userlistSchema);
