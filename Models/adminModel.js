const mongoose = require("mongoose");
const extendSchema = require("mongoose-extend-schema");
const autoIncrement = require('mongoose-sequence')(mongoose);
const basicUserSchema = require("./userModel");

const adminSchema = extendSchema(basicUserSchema, {
	_id: Number,
	hireDate: {
		type: Date,
		default: Date.now(),
	},
	salary: {
		type: Number,
		default: 3500,
	},
}, { _id: false });
adminSchema.plugin(autoIncrement, { id: 'adminId', inc_field: '_id' });
mongoose.model("admin", adminSchema);
