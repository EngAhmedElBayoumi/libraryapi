

const mongoose=require("mongoose");
const bcrypt = require('bcrypt');
const { generatePassword } = require("../Core/Utilities/utilities");
const fs = require("fs");
const saltRounds =10;

require("./../Models/basicAdminModel");
require("../Models/userListModel");

const BasicAdminSchema=mongoose.model("basicAdmins");
const userListSchema = mongoose.model("userlists");

const jwt = require("jsonwebtoken");




//get all of basic admin
exports.getAllBasicAdmin= async (request,response,next)=>{
    try {
        const basicAdmin = await BasicAdminSchema.find();
        response.status(200).json({data: basicAdmin});
    } catch (error) {
       next(error);
    }
}
//add basic admin
exports.addBasicAdmin = async (request, response, next) => {
  try {
    const imagePath = request.file === undefined ? null : request.file.path;
    // Check if email already exists
    const existingAdmin = await BasicAdminSchema.findOne({ email: request.body.email });
    if (existingAdmin) {
      throw new Error('Email already exists');
    }

    // Create new basicAdmin object
    const basicAdmin = new BasicAdminSchema({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      // generate a temporary password
      tmpPassword: generatePassword(16),
      birthDate: request.body.birthDate,
      hireDate: Date.now(),
      image: imagePath,
      salary: request.body.salary,
    });

    // Save the data to the database
    const data = await basicAdmin.save()
    .then((data) => {
      new userListSchema({
        email: request.body.email,
        role: "basicAdmin",
      })
      .save()
      .then(()=>{
        response.status(201).json({ data });
      })
      .catch((error)=>{
        throw new Error(error);
      })
    })
  } catch (error) {
    if (request.file) {
      // delete uploaded file if there's an error
      fs.unlink(request.file.path, (error) => {
        if (error) {
          console.log(`Error deleting file: ${error}`);
        }
      });
    }
    response.status(400).json({ error: error.message });
  }
};

// update basic admin
exports.updateBasicAdminByBasicAdmin = (request, response, next) => {
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
  BasicAdminSchema.findOne({ _id: request.body.basicAdminId })
    .then((data) => {
      if (data === null) {
        throw new Error("Basic admin not found");
      }
      else if (data.isRoot === true) {
        throw new Error("this is root");
      }
      else if (request.body.password && data.tmpPassword) {
        throw new Error("Basic admin didn't activate his/her account yet");
      }
      else if (request.body.hireDate) {
        throw new Error("hireDate cannot be changed once the user has been created");
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
        return BasicAdminSchema.updateOne(
          {
            _id: request.body.basicAdminId,
          },
          {
            $set: {
              firstName: request.body.firstName,
              lastName: request.body.lastName,
              email: request.body.email,
              password: request.body.password,
              birthDate: request.body.birthDate,
              image:newImagePath,
              salary: request.body.salary,
            }
          }
        );
      }
    })
    .then((data) => {
      if (data.matchedCount === 0) next(new Error("Basic admin not found"));
      else{
        return new userListSchema.updateOne(
          {
            _id:id,
          },
          {
            $set:{
              email: request.body.email,
            }
          }
        )
        .save()
        .then(()=>{
          response.status(200).json({ data: "Basic admin updated successfully" });
        });
      }
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

exports.updateBasicAdminById = (request, response, next) => {
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
  BasicAdminSchema.findOne({ _id: request.params.id })
    .then((data) => {
      if (data === null){
        throw new Error("Basic admin not found");
      }
      else if (request.body.email) {
        throw new Error("Basic admin cannot update his/her email");
      }
      else if (request.body.salary) {
        throw new Error("Basic admin cannot update his/her salary");
      }
      else if (request.body.hireDate) {
        throw new Error("Basic admin cannot update his/her hireDate");
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
        return BasicAdminSchema.updateOne(
          {
            _id: request.params.id,
          },
          {
            $set: {
              firstName: request.body.firstName,
              lastName: request.body.lastName,
              password: request.body.password,
              birthDate: request.body.birthDate,
              image:newImagePath,
            }
          }
        );
      }
    })
    .then((data) => {
      if (data.matchedCount === 0) next(new Error("Basic admin not found"));
      else{ 
        return new userListSchema.updateOne(
          {
            _id:id,
          },
          {
            $set:{
              email: request.body.email,
            }
          }
        )
        .save()
        .then(()=>{
          response.status(200).json({ data: "Basic admin updated successfully"});
        });
      }
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

exports.activateBasicAdmin = (request, response, next) => {
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
  BasicAdminSchema.findOne({ _id: request.params.id })
    .then((data) => {
      if (data === null) {
        throw new Error("Basic admin not found");
      }
      else if (data.password) {
        throw new Error("Account is already activated");
      }
      else if (request.body.email) {
        throw new Error("Basic admin cannot update his/her email");
      }
      else if (request.body.salary) {
        throw new Error("Basic admin cannot update his/her salary");
      }
      else if (request.body.hireDate) {
        throw new Error("Basic admin cannot update his/her hireDate");
      }
      else if (request.body.oldPassword !== data.tmpPassword) {
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
        return BasicAdminSchema.updateOne(
          {
            _id: request.params.id,
          },
          {
            $set: {
              firstName: request.body.firstName,
              lastName: request.body.lastName,
              password: request.body.newPassword,
              birthDate: request.body.birthDate,
              image:newImagePath,
            },
            $unset: {
              tmpPassword: 1
            }
          }
        );
      }
    })
    .then((data) => {
      if (data.matchedCount === 0) next(new Error("Basic admin not found"));
      else response.status(200).json({ data: "Basic admin activated successfully" });
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
// delete basic admin 
exports.deleteBasicAdmin = (request, response, next) => {
  let imagePath;

  BasicAdminSchema.findOne({ _id: request.body.id })
    .then((data) => {
      if (data === null) {
        throw new Error("Basic admin not found");
      }
      else if (data.isRoot === true) {
        throw new Error("Root basic admin cannot be deleted");
      }
      else {
        imagePath = data.image === undefined ? null : data.image;
        return BasicAdminSchema.deleteOne({ _id: request.body.id });
      }
    })
    .then((data) => {
      if (imagePath !== null) {
        fs.unlink(imagePath, (error) => {
          console.log(error);
          return;
        });
      }
      if (data === null) {
        response.status(404).json({ msg: 'Not Found' });
      } else {
        response.status(200).json({ msg: 'Deleted' });
      }
    })
    .catch((error) => next(error));
};

// get basic admin by id
exports.getOneBasicAdmin = (request, response, next) => {
  BasicAdminSchema.findOne({ _id: request.params.id })
    .then((data) => {
      if (data === null)
        response.status(404).json({ message: "basicAdmin not found" });
      else
        response.status(200).json({ data });
    })
    .catch((error) => {
      next(error);
    });
};
