const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { generatePassword } = require("../Core/Utilities/utilities");
require("../Models/memberModel");
require("../Models/transactionModel");
require("../Models/userListModel");
const memberSchema = mongoose.model("members");
const userListSchema = mongoose.model("userlists");
const transactionSchema = mongoose.model("transactions");
const saltRounds = 10;
const jwt = require("jsonwebtoken");


//get all members
exports.getAllMembers = (request, response, next)=>{
    memberSchema.find({})
    .then((data)=>{
        response.status(200).json({data});
    })
    .catch((error)=>{
        next(error);
    });
}

// get member by id
exports.getMemberById = (request, response, next)=>{
    memberSchema.findOne({_id: request.params.id})
    .then((data)=>{
      if(data===null)
        response.status(404).json({message:'Member not found'});
      else
        response.status(200).json({data});
    })
    .catch((error)=>{
        next(error);
    });
}

//get member by email
exports.getMemberByEmail = (request, response, next)=>{
    memberSchema.findOne({email: request.params.email})
    .then((data)=>{
      if(data===null)
        response.status(404).json({message:'Member not found'});
      else
        response.status(200).json({data});
    }
    )
    .catch((error)=>{
        next(error);
    }
    );
}

//get member by firstName+lastName
exports.getMemberByName = (request, response, next)=>{
    memberSchema.findOne({
      firstName: { $regex: request.params.firstName, $options: "i" } ,
      lastName: { $regex: request.params.lastName, $options: "i"}
    })
    .then((data)=>{
      if(data===null)
        response.status(404).json({message:'Member not found'});
      else
        response.status(200).json({data});
    }
    )
    .catch((error)=>{
        next(error);
    }
    );
}

//add member
exports.addMember=(request, response, next)=>{
    const imagePath = request.file === undefined ? null : request.file.path;
    new memberSchema({
        firstName:request.body.firstName,
        lastName:request.body.lastName,
        email:request.body.email,
        tmpPassword: generatePassword(16),
        gender:request.body.gender,
        birthDate:request.body.birthDate,
        phoneNumber:request.body.phoneNumber,
        address:request.body.address,
        image: imagePath
      })
    .save()
    .then((data) => {
      return new userListSchema({
        email: request.body.email,
        role: "member",
      })
      .save()
      .then(()=>{
        response.status(201).json({ data });
      })
      .catch((error)=>{
        next(error);
      })
    })
    .catch((error) => {
        fs.unlink(imagePath, (error) => {
          console.log(error);
          return;
        });
        next(error);
      });
}

//update member By Admin
exports.updateMemberByAdmin = (request, response, next) => {
  const token = request.get("authorization").split(" ")[1];
  const decodedToken = jwt.verify(token,"HelloWorld");
  const oldPassword = decodedToken.data.oldPassword;
  const userEmail = decodedToken.data.email;
  let oldImagePath, newImagePath, deleteUploadedImage;
  // response.status(200).json({ data: "Member updated successfully" });
  if (request.file === undefined) {
    newImagePath = null;
    deleteUploadedImage = false;
  }
  else {
    newImagePath = request.file.path;
    deleteUploadedImage = true;
  }

  if (request.body.password !== undefined) {
    request.body.password = bcrypt.hash(request.body.password, saltRounds);
  }
  if(!request.body.id)
    response.status(404).json({message: "Id not found please pass it"});
  memberSchema.findOne({ _id: request.body.id })
    .then((data) => {
      if (data === null) {
        response.status(404).json({ message: "Member not found" });
      }
      else if (request.body.password && data.tmpPassword) {
        response.status(400).json({ message: "Member didn't activate his/her account yet" });
      }
      else if (request.body.createdAt) {
        response.status(400).json({ message: "create date cannot be changed once the member has been created" });
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
        return memberSchema.updateOne(
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
              phoneNumber: request.body.phoneNumber,
              address: request.body.address,
              image: newImagePath,
            }
          }
        );
      }
    })
    .then((data) => {
      if (data.matchedCount === 0) next(new Error("Member not found"));
      else{ 
        return userListSchema.updateOne(
          {
            email: userEmail,
          },
          {
            $set:{
              email: request.body.email,
            }
          }
        )
        .then(()=>{
          response.status(200).json({ data: "Member updated successfully" });
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

//update member By Id
exports.updateMemberById = (request, response, next) => {
  let oldImagePath, newImagePath, deleteUploadedImage;

  if (request.file === undefined) {
    newImagePath = null;
    deleteUploadedImage = false;
  }
  else {
    newImagePath = request.file.path;
    deleteUploadedImage = true;
  }

  if (request.body.email) {
    response.status(403).json({ message: "Member cannot update his/her email" });
  }
  else if(request.body.preventBorrowUntil){
    response.status(403).json({ message: "Member cannot change this section" });
  }
  else if (request.body.createdAt) {
    response.status(403).json({ message: "Member cannot update his/her hireDate" });
  }

  if (request.body.password !== undefined) {
    request.body.password = bcrypt.hash(request.body.password, saltRounds);
  }
  memberSchema.findOne({ _id: request.params.id })
    .then((data) => {
      if (data === null)
        response.status(404).json({ message: "Member not found" });
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
        return memberSchema.updateOne(
          {
            _id: request.params.id,
          },
          {
            $set: {
              firstName: request.body.firstName,
              lastName: request.body.lastName,
              password:request.body.password,
              gender: request.body.gender,
              birthDate: request.body.birthDate,
              phoneNumber: request.body.phoneNumber,
              address: request.body.address,
              image: newImagePath,
            }
          }
        );
      }
    })
    .then((data) => {
      if (data.matchedCount === 0) next(new Error("Member not found"));
      else{ 
        response.status(200).json({ data: "Member updated successfully" });
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

//update member data by the same member ( Note : check if the user is member and his id is the same id in the parameter)
exports.activateMember = (request, response, next) => {
  const token = request.get("authorization").split(" ")[1];
  const decodedToken = jwt.verify(token,"HelloWorld");
  const oldPassword = decodedToken.data.oldPassword;

  let oldImagePath, newImagePath, deleteUploadedImage;

  if (request.file === undefined) {
    newImagePath = null;
    deleteUploadedImage = false;
  }
  else {
    newImagePath = request.file.path;
    deleteUploadedImage = true;
  }

  if (request.body.newPassword) {
    request.body.newPassword = bcrypt.hashSync(request.body.newPassword, saltRounds);
  }
  else{
    throw new Error("please enter new password")
  }
  memberSchema.findOne({ _id: request.params.id })
    .then((data) => {
      if (request.body.email) {
        throw new Error("Member cannot update his/her email");
      }
      else if(request.body.preventBorrowUntil){
        throw new Error("Member cannot change this section");
      }
      else if (request.body.createdAt) {
        throw new Error("member cannot update his/her hireDate");
      }
      if (data === null) {
        throw new Error("Member not found");
      }
      else if (request.body.oldPassword !== oldPassword) {
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
        return memberSchema.updateOne(
          {
            _id: request.params.id,
          },
          {
            $set: {
              firstName: request.body.firstName,
              lastName: request.body.lastName,
              password:request.body.newPassword,
              gender: request.body.gender,
              birthDate: request.body.birthDate,
              phoneNumber: request.body.phoneNumber,
              address: request.body.address,
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
      if (data.matchedCount === 0) next(new Error("Member not found"));
      else{ 
          response.status(200).json({ data: "Member updated successfully" });
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

exports.deleteMember = (request, response, next) => {
  // memberSchema.deleteMany({});
  /////////////////////////////////////////////////////////////////////////////////
  let imagePath;
  let userEmail;
  memberSchema.findOne({ _id: request.body.id })
    .then((data) => {
      if (data === null) {
        response.status(404).json({ message: "Member not found" });
      }
      email = data.email;
      imagePath = data.image;
      return transactionSchema.findOne({
        Id: request.body.id,
        isReturnd: false
      })
    })
    .then((data) => {
      if (data !== null) {
        response.status(400).json({ message: "Member can't be deleted as he is still responsible for returning borrowed/read books" });
      }
      else if (imagePath !== null) {
        fs.unlink(imagePath, (error) => {
          return;
        });
      }
      return memberSchema.deleteOne({ _id: request.body.id })
      .then(()=>{
        userListSchema.deleteOne({email:userEmail})
      });
    })
    .then((data) => {
      if (data.deletedCount == 0) next(new Error("Member not found"));
      else response.status(200).json({ data: "Member deleted successfully" });
    })
    .catch((error) => {
      next(error);
    });
};
