const { request, response } = require("express");
const mongoose = require("mongoose");
const bookModel = require("../Models/bookModel");
require("../Models/transactionModel");
require("../Models/bookModel");
require("../Models/employeeModel");
require("../Models/memberModel");
const TransactionSchema = mongoose.model("transactions");
const BookSchema = mongoose.model("books");
const EmployeeSchema = mongoose.model("employees");
const MemberSchema = mongoose.model("members");

// add new transaction
exports.addTransaction = async (request, response, next) => {
  try {
    // Get employee ID from JWT
    const employeeId = 5 /*request.body.employeeId*/;

    // Set the end date
    let duration;
    if (request.body.status === "read") duration = 1;
    else duration = 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    // Check if book ID exists in BookSchema
    const book = await BookSchema.findOne({_id: request.body.bookId});
    if (!book) {
      throw new Error("Book not found");
    } else if ((request.body.status === "read"   && book.Available <= 0) ||
               (request.body.status === "borrow" && book.Available <= 1)) {
      throw new Error("Book not available");
    }

      // Check if member ID exists in MemberSchema
    const member = await MemberSchema.findOne({_id: request.body.memberId});
    if (!member) {
      throw new Error("Member not found");
    }
      //check if member is banned
    if (member.isBanned) {
      throw new Error("Member is banned");
    }
      //check if member.preventBorrowUntil >= data.now
    // if (member.preventBorrowUntil > Date.now()) {
    //   throw new Error("Member is banned");
    // }

             // Check if employee ID exists in EmployeeSchema
    // const employee = await EmployeeSchema.findOne({_id: employeeId});
    // if (!employee) {
    //   throw new Error("Employee not found");
    // }

    // Check if member already has an active transaction with the same book
    const existingTransaction = await TransactionSchema.findOne({
      memberId: request.body.memberId, bookId: request.body.bookId, isReturned: false});
    if (existingTransaction) {
      throw new Error("Member already has this book");
    }
    // Create new transaction
    const newTransaction = new TransactionSchema({
      employeeId,
      memberId:request.body.memberId,
      bookId: request.body.bookId,
      status: request.body.status,
      startDate: Date.now(),
      endDate,
    });
    const savedTransaction = await newTransaction.save();
    //update book available 
    book.Avilable -= 1;
    await book.save();
    response.status(201).json({ data: savedTransaction });
  } catch (error) {
    next(error);
  }
};

//return Transaction
exports.returnTransaction = async (request, response, next) => {
  try {
    // Find transaction 
    const transaction = await TransactionSchema.findOne({
      bookId: request.body.bookId,
      memberId: request.body.memberId,
      isReturned: false
    });
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    //check if member is banned
    const member = await MemberSchema.findOne({_id: request.body.memberId});
    if (member.isBanned) {
      const preventBorrowUntil = new Date();
      preventBorrowUntil.setDate(preventBorrowUntil.getDate() + 7);
      member.preventBorrowUntil = preventBorrowUntil;
      await member.save();
    }

    // Mark transaction as returned and update end date
    transaction.isReturned = true;
    transaction.endDate = Date.now();
    const updatedTransaction = await transaction.save();
    // Update book availability
    const book = await BookSchema.findOne({ _id: request.body.bookId });
    book.Avilable += 1;
    await book.save();
    response.status(200).json({ data: updatedTransaction });

  } catch (error) {
    next(error);
  }
};

//update Transaction to give more time
exports.updateTransaction = async (request, response, next) => {
  try {
    // Find transaction
    const transaction = await TransactionSchema.findOne({
      bookId: request.body.bookId,
      memberId: request.body.memberId,
      isReturned: false
    });
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    // Update transaction
      transaction.status = "borrow";
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      transaction.endDate = endDate;
    

    const updatedTransaction = await transaction.save();
    response.status(200).json({ data: updatedTransaction });
  } catch (error) {
    next(error);
  }
};

//get all transactions
exports.getTransactions = (request, response, next) => {
  TransactionSchema.find()
    .then((data) => {
      response.status(200).json({ data });
    })
    .catch((error) => {
      next(error);
    });
};

//get all transaction for specific employee
exports.getEmployeeTransactions = (request, response, next) => {
  TransactionSchema.find({employeeId: request.params.id})
    .then((data) => {
      response.status(200).json({ count:data.length,data: data });
    })
    .catch((error) => {
      next(error);
    });
}

//get all transaction for specific member
exports.getMemberTransactions = (request, response, next) => {
  TransactionSchema.find({memberId: request.params.id})
    .then((data) => {
      response.status(200).json({ count:data.length,data: data });
    })
    .catch((error) => {
      next(error);
    });
}

//get all transactions for specific book
exports.getBookTransactions = (request, response, next) => {
  TransactionSchema.find({bookId: request.params.id})
    .then((data) => {
      response.status(200).json({ data });
    })
    .catch((error) => {
      next(error);
    });
}


//get all transactions that Overdue
exports.getOverdueTransactions = (request, response, next) => {
  TransactionSchema.find({endDate: {$lt: Date.now()}, isReturned: false})
    .then((data) => {
      response.status(200).json({ data });
    })
    .catch((error) => {
      next(error);
    });
}


//delete all transactions that his book has been returned
exports.deleteTransaction = (request, response, next) => {
  TransactionSchema.deleteMany({isReturned: true})
    .then((data) => {
      response.status(200).json({ data });
    })
    .catch((error) => {
      next(error);
    });
}

//delete specific transaction by bookid and member id
exports.deleteSpecificTransactionByMemberIdAndBookId = (request, response, next) => {
  TransactionSchema.findOne({bookId: request.params.id, memberId: request.params.memberId})
    .then((data) => {
      if (data == null) next(new Error("Transaction not found"));
      else if (data.isReturned == true) {
        TransactionSchema.deleteOne({bookId: request.params.id, memberId: request.params.id2})
          .then((data) => {
            response.status(200).json({ data });
          })
          .catch((error) => {
            next(error);
          });
      } else {
        response.status(200).json({ message: "Can't delete before return the book" });
      }
    })
    .catch((error) => {
      next(error);
    });
}


//delete specific transaction by id
exports.deleteSpecificTransactionById = (request, response, next) => {
  TransactionSchema.findOne({_id: request.params.id})
    .then((data) => {
      if (data == null) next(new Error("Transaction not found"));
      else if (data.isReturned == true) {
        TransactionSchema.deleteOne({_id: request.params.id})
          .then((data) => {
            response.status(200).json({ data });
          })
          .catch((error) => {
            next(error);
          });
      } else {
        response.status(200).json({ message: "Can't delete before return the book" });
      }
    })
    .catch((error) => {
      next(error);
    });
}


//delete all transaction for specific member 
exports.deleteAllTransactionForSpecificMember = (request, response, next) => {
  TransactionSchema.find({memberId: request.params.id})
    .then((data) => {
      if (data == null) next(new Error("Transaction not found"));
      else {
        for (let i = 0; i < data.length; i++) {
          if (data[i].isReturned == false) {
            response.status(200).json({ message: "Can't delete before return the book" });
            return;
          }
        }
        TransactionSchema.deleteMany({memberId: request.params.id})
          .then((data) => {
            response.status(200).json({ data });
          })
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => {
      next(error);
    });
}

//delete all transaction for specific employee
exports.deleteAllTransactionForSpecificEmployee = (request, response, next) => {
  TransactionSchema.find({employeeId: request.params.id})
    .then((data) => {
      if (data == null) next(new Error("Transaction not found"));
      else {
        for (let i = 0; i < data.length; i++) {
          if (data[i].isReturned == false) {
            response.status(200).json({ message: "Can't delete before return the book" });
            return;
          }
        }
        TransactionSchema.deleteMany({employeeId: request.params.id})
          .then((data) => {
            response.status(200).json({ data });
          })
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => {
      next(error);
    });
}

//delete all transaction for specific book 
exports.deleteAllTransactionForSpecificbook = (request, response, next) => {
  TransactionSchema.find({bookId: request.params.id})
    .then((data) => {
      if (data == null) next(new Error("Transaction not found"));
      else {
        for (let i = 0; i < data.length; i++) {
          if (data[i].isReturned == false) {
            response.status(200).json({ message: "Can't delete before return the book" });
            return;
          }
        }
        TransactionSchema.deleteMany({bookId: request.params.id})
          .then((data) => {
            response.status(200).json({ data });
          })
          .catch((error) => {
            next(error);
          });
      }
    }
    )
    .catch((error) => {
      next(error);
    }
    );
}


//check all book that enddate <= data.now-1 and make isBanned=true and return data for member these member
exports.checkBook = (request, response, next) => {
  TransactionSchema.find({endDate: {$lt: Date.now()}, isReturned: false})
    .then((data) => {
      if (data == null) next(new Error("all book must return has returned"));
      else {
        for (let i = 0; i < data.length; i++) {
          MemberSchema.findOneAndUpdate({ _id: data[i].memberId }, { isBanned: true })
            .then((data) => {
              response.status(200).json({ data });
            })
            .catch((error) => {
              next(error);
            });
        }
      }
    })
    .catch((error) => {
      next(error);
    });
} 


