const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { generatePassword } = require("../Core/Utilities/utilities");
require("../Models/adminModel");
require("../Models/userListModel");
const AdminSchema = mongoose.model("admin");
const UserListSchema = mongoose.model("userlists");
const saltRounds = 10;

exports.allAdmins = (request, response, next) => {
	AdminSchema.find({})
		.then((data) => {
			response.status(200).json({ data });
		})
		.catch((error) => {
			next(error);
		});
}; // Route --> /admins/

exports.getOneAdmin = (request, response, next) => {
	AdminSchema.findOne({ _id: request.params.id })
		.then((data) => {
			if (data) response.status(200).json({ data });
			else response.status(404).json({ message: "Admin not found" });
		})
		.catch((error) => {
			next(error);
		});
}; // --> Route >> /admins/:id

exports.insertAdmin = (request, response, next) => {
	const imagePath = request.file === undefined ? null : request.file.path;
	new AdminSchema({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		email: request.body.email,
		tmpPassword: generatePassword(16),
		gender: request.body.gender,
		birthDate: request.body.birthDate,
		salary: request.body.salary,
		image: imagePath,
	})
		.save()
		.then((data) => {
			return new UserListSchema({
				email: data.email,
				role: "admin",
			}).save();
		})
		.then((data) => {
			response.status(201).json({ data });
		})
		.catch((error) => {
			next(error);
		});
}; // Route >> admins/ POST
// Added Stuff 
exports.updateAdmin = (request, response, next) => {
	// This is Going to be used By the Superior One
	let imagePath = request.file === undefined ? null : request.file.path;
	if (request.body.password !== undefined) {
		request.body.password = bcrypt.hashSync(
			request.body.password,
			saltRounds
		);
	}
	AdminSchema.findOne({ _id: request.body.id }, { image: 1 })
		.then((data) => {
			if (data !== null && data.image !== null) {
				if (imagePath === null) imagePath = data.image;
				else {
					fs.unlink(data.image, (error) => {
						console.log(error);
						return;
					});
				}
			} else {
				if (imagePath !== null) {
					fs.unlink(imagePath, (error) => {
						console.log(error);
						return;
					});
				}
			}
			return AdminSchema.updateOne(
				{
					_id: request.body.id,
				},
				{
					$set: {
						firstName: request.body.firstName,
						lastName: request.body.lastName,
						email: request.body.email,
						password: request.body.password,
						gender: request.body.gender,
						birthDate: request.body.birthDate,
						salary: request.body.salary,
						image: imagePath,
					},
				}
			);
		})
		.then((data) => {
			UserListSchema.findOneAndUpdate(
				{ email: data.email },
				{ $set: { email: request.body.email } }
			);
		})
		.then((data) => {
			if (data.matchedCount === 0) next(new Error("Admin not found"));
			else
				response
					.status(200)
					.json({ data: "Admin updated successfully" });
		})
		.catch((error) => {
			if (imagePath != null) {
				fs.unlink(imagePath, (error) => {
					console.log(error);
					return;
				});
			}
			next(error);
		});
}; // Route >> admins/ PATCH
//Added Stuff 
exports.deleteAdmin = (request, response, next) => {
	AdminSchema.findOne({ _id: request.body.id })
		.then((data) => {
			if (data !== null && data.image !== null) {
				fs.unlink(data.image, (error) => {
					console.log(error);
					return;
				});
			}
			return AdminSchema.deleteOne({ _id: request.body.id });
		})
		.then((data) => {
			if (data.deletedCount == 0) next(new Error("Admin not found"));
			else
				response
					.status(200)
					.json({ data: "Admin deleted successfully" });
		})
		.catch((error) => {
			next(error);
		});
}; // Route >> /admin DELETE

exports.activateAdmin = (request, response, next) => {
	if (request.body.newPassword !== undefined) {
		request.body.newPassword = bcrypt.hashSync(
			request.body.newPassword,
			saltRounds
		);
	} else {
		err = new Error("Put the New Passsword In order to Activate");
		next(err);
	}

	if (request.body.email || request.body.salary || request.body.hireDate) {
		err = new Error(
			"Email , Hire Date && salary are not Allowed to be updated By user!"
		);
		next(err);
	}
	AdminSchema.findOne({ _id: request.params.id })
		.then((data) => {
			if (data === null) {
				throw new Error("Account not found");
			} else if (data.password) {
				throw new Error("Account is already activated");
			} else if (request.body.oldPassword != data.tmpPassword) {
				throw new Error("Old password is incorrect");
			} else {
				return AdminSchema.updateOne(
					{
						_id: request.params.id,
					},
					{
						$set: {
							firstName: request.body.firstName,
							lastName: request.body.lastName,
							password: request.body.newPassword,
							gender: request.body.gender,
							birthDate: request.body.birthDate,
						},
						$unset: {
							tmpPassword: 1,
						},
					}
				);
			}
		})
		.then((data) => {
			if (data.matchedCount === 0)
				throw new Error("Admin Account is not found");
			else response.status(200).json({ message: "Account activated !" });
		})
		.catch((error) => {
			// FIXME the Image is not needed For activation if we will Enable him to update it
			next(error);
		});
};
exports.updateAdminById = (request, response, next) => {
	if (request.body.password !== undefined) {
		request.body.password = bcrypt.hashSync(
			request.body.password,
			saltRounds
		);
	}
	let imagePath = request.file === undefined ? null : request.file.path;

	if (request.body.email || request.body.hireDate || request.body.salary) {
		let err = new Error(
			"You are not allowed to Edit Salary or Email Or hire Date"
		);
		next(err);
	}
	AdminSchema.findOne({ _id: request.params.id }, { image: 1 })
		.then((data) => {
			if (data !== null && data.image !== null) {
				if (imagePath === null) imagePath = data.image;
				else {
					fs.unlink(data.image, (error) => {
						console.log(error);
						return;
					});
				}
			} else {
				if (imagePath !== null) {
					fs.unlink(imagePath, (error) => {
						console.log(error);
						return;
					});
				}
			}
			return AdminSchema.updateOne(
				{
					_id: request.params.id,
				},
				{
					$set: {
						firstName: request.body.firstName,
						lastName: request.body.lastName,
						password: request.body.password,
						gender: request.body.gender,
						birthDate: request.body.birthDate,
						image: imagePath,
					},
				}
			);
		})
		.then((data) => {
			if (data.matchedCount === 0) next(new Error("Admin not found"));
			else
				response
					.status(200)
					.json({ data: "Admin updated successfully" });
		})
		.catch((error) => {
			if (imagePath != null) {
				fs.unlink(imagePath, (error) => {
					console.log(error);
					return;
				});
			}
			next(error);
		});
};
