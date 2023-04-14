const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { generatePassword } = require("../Core/Utilities/utilities");
require("../Models/employeeModel");
require("../Models/transactionModel");
const EmployeeSchema = mongoose.model("employees");
const transactionSchema = mongoose.model("transactions");
const userListSchema = mongoose.model("userlists");
const saltRounds = 10;

exports.getEmployees = (request, response, next) => {
  if (request.query.firstname === undefined) {
    request.query.firstname = "";
  }
  if (request.query.lastname === undefined) {
    request.query.lastname = "";
  }
  EmployeeSchema.find({
      firstName: { $regex: request.query.firstname, $options: "i" },
      lastName: { $regex: request.query.lastname, $options: "i" }
    })
    .then((data) => {
      response.status(200).json({ data });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getEmployeeById = (request, response, next) => {
  EmployeeSchema.findOne({ _id: request.params.id })
    .then((data) => {
      if (data === null) {
        response.status(404).json({ message: "Employee not found" });
      }
      else {
        response.status(200).json({ data });
      }
    })
    .catch((error) => {
      next(error);
    });
};

exports.addEmployee = (request, response, next) => {
  const imagePath = request.file === undefined ? null : request.file.path;

  new EmployeeSchema({
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
    return new userListSchema({
      email: request.body.email,
      role: "employee",
    })
    .save()
  })
  .then((data) => {
    response.status(201).json({ data });
  })
  .catch((error) => {
    if (imagePath !== null) {
      fs.unlink(imagePath, (error) => {
        return;
      });
    }
    next(error);
  });
};

exports.updateEmployeeByAdmin = (request, response, next) => {
  let oldImagePath, newImagePath, deleteUploadedImage;
  let oldEmail;

  if (request.file === undefined) {
    newImagePath = null;
    deleteUploadedImage = false;
  }
  else {
    newImagePath = request.file.path;
    deleteUploadedImage = true;
  }

  if (request.body.password !== undefined) {
    request.body.password = bcrypt.hashSync(request.body.password, saltRounds);
  }
  EmployeeSchema.findOne({ _id: request.body.employeeId })
    .then((data) => {
      if (data === null) {
        throw new Error("Employee not found");
      }
      else if (request.body.password && data.tmpPassword) {
        throw new Error("Employee didn't activate his/her account yet");
      }
      else if (request.body.hireDate) {
        throw new Error("hireDate cannot be changed once the user has been created");
      }
      else {
        oldEmail = request.body.email === undefined ? null : data.email;
        deleteUploadedImage = false;
        oldImagePath = data.image;
  
        if (oldImagePath !== null) {
          if (newImagePath === null) {
            newImagePath = oldImagePath;
          }
          else {
            fs.unlink(oldImagePath, (error) => {
              return;
            })
          }
        }
        return EmployeeSchema.updateOne(
          {
            _id: request.body.employeeId,
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
              image: newImagePath,
            }
          }
        );
      }
    })
    .then((data) => {
      if (data.matchedCount === 0) throw new Error("Employee not found");
      else {
        return new userListSchema.updateOne(
          {
            email: oldEmail
          },
          {
            $set:{
              email: request.body.email,
            }
          }
        )
      }
    })
    .then((data) => {
      response.status(200).json({ data: "Employee updated successfully" });
    })
    .catch((error) => {
      if (deleteUploadedImage) {
        fs.unlink(newImagePath, (error) => {
          return;
        });
      }
      next(error);
    });
};

exports.updateEmployeeById = (request, response, next) => {
  let oldImagePath, newImagePath, deleteUploadedImage;

  if (request.file === undefined) {
    newImagePath = null;
    deleteUploadedImage = false;
  }
  else {
    newImagePath = request.file.path;
    deleteUploadedImage = true;
  }

  if (request.body.password !== undefined) {
    request.body.password = bcrypt.hashSync(request.body.password, saltRounds);
  }
  EmployeeSchema.findOne({ _id: request.params.id })
    .then((data) => {
      if (data === null)
        throw new Error("Employee not found");
      else if (request.body.email) {
        throw new Error("Employee cannot update his/her email");
      }
      else if (request.body.salary) {
        throw new Error("Employee cannot update his/her salary");
      }
      else if (request.body.hireDate) {
        throw new Error("Employee cannot update his/her hireDate");
      }
      else {
        deleteUploadedImage = false;
        oldImagePath = data.image;
  
        if (oldImagePath !== null) {
          if (newImagePath === null) {
            newImagePath = oldImagePath;
          }
          else {
            fs.unlink(oldImagePath, (error) => {
              return;
            })
          }
        }
        return EmployeeSchema.updateOne(
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
              image: newImagePath,
            }
          }
        );
      }
    })
    .then((data) => {
      if (data.matchedCount === 0) throw new Error("Employee not found");
      else response.status(200).json({ data: "Employee updated successfully" });
    })
    .catch((error) => {
      if (deleteUploadedImage) {
        fs.unlink(newImagePath, (error) => {
          return;
        });
      }
      next(error);
    });
};

exports.activateEmployee = (request, response, next) => {
  let oldImagePath, newImagePath, deleteUploadedImage;

  if (request.file === undefined) {
    newImagePath = null;
    deleteUploadedImage = false;
  }
  else {
    newImagePath = request.file.path;
    deleteUploadedImage = true;
  }

  if (request.body.newPassword !== undefined) {
    request.body.newPassword = bcrypt.hashSync(request.body.newPassword, saltRounds);
  }
  EmployeeSchema.findOne({ _id: request.params.id })
    .then((data) => {
      if (data === null) {
        throw new Error("Employee not found");
      }
      else if (data.password) {
        throw new Error("Account is already activated");
      }
      else if (request.body.email) {
        throw new Error("Employee cannot update his/her email");
      }
      else if (request.body.salary) {
        throw new Error("Employee cannot update his/her salary");
      }
      else if (request.body.hireDate) {
        throw new Error("Employee cannot update his/her hireDate");
      }
      else if (request.body.oldPassword != data.tmpPassword) {
        console.log(request.body.oldPassword);
        console.log(data.tmpPassword);
        throw new Error("Old password is incorrect");
      }
      else {
        deleteUploadedImage = false;
        oldImagePath = data.image;
  
        if (oldImagePath !== null) {
          if (newImagePath === null) {
            newImagePath = oldImagePath;
          }
          else {
            fs.unlink(oldImagePath, (error) => {
              return;
            })
          }
        }
        return EmployeeSchema.updateOne(
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
              image: newImagePath,
            },
            $unset: {
              tmpPassword: 1
            }
          }
        );
      }
    })
    .then((data) => {
      if (data.matchedCount === 0) throw new Error("Employee not found");
      else response.status(200).json({ data: "Employee activated successfully" });
    })
    .catch((error) => {
      if (deleteUploadedImage) {
        fs.unlink(newImagePath, (error) => {
          return;
        });
      }
      next(error);
    });
};

exports.deleteEmployee = (request, response, next) => {
  let imagePath;
  let employeeEmail;
  EmployeeSchema.findOne({ _id: request.body.id })
    .then((data) => {
      if (data === null) {
        throw new Error("Employee not found");
      }
      employeeEmail = data.email;
      imagePath = data.image;
      return transactionSchema.findOne({
        employeeId: request.body.id,
        isReturnd: false
      })
    })
    .then((data) => {
      if (data !== null) {
        throw new Error("Employee can't be deleted as he is still responsible for returning borrowed/read books");
      }
      else if (imagePath !== null) {
        fs.unlink(imagePath, (error) => {
          return;
        });
      }
      return EmployeeSchema.deleteOne({ _id: request.body.id });
    })
    .then((data) => {
      if (data.deletedCount == 0) throw new Error("Employee not found");
      else {
        return userListSchema.deleteOne({ email: employeeEmail });
      }
    })
    .then((data) => {
      response.status(200).json({ data: "Employee deleted successfully" });
    })
    .catch((error) => {
      next(error);
    });
};
