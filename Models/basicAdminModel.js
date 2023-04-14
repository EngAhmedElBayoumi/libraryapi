
const mongoose=require("mongoose");
const extendSchema = require("mongoose-extend-schema");
const userSchema = require("./userModel");
const autoIncrement = require('mongoose-sequence')(mongoose);

const basicAdminSchema = extendSchema(userSchema,{
  _id: Number,
	hireDate: {
		type: Date,
		default: Date.now(),
	},
	salary: {
		type: Number,
		default: 3500,
	},
	isRoot: {
		type: Boolean,
		default: false
	}
}, { _id: false });

basicAdminSchema.plugin(autoIncrement, { id: 'basicAdminId', inc_field: '_id' });
mongoose.model("basicAdmins",basicAdminSchema);
















