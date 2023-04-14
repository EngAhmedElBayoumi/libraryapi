const express = require("express");
// const validateMW = require("../Core/Validations/validateMW");
const controller = require("../Controllers/transactionController");
// import validateTransaction
const validateTransaction = require("../Core/Validations/validateTransaction");
//import validateMW
const validateMW = require('./../Core/Validations/validateMW');
//import authMW
const authMW = require('./../Middlewares/authMW');
//import authenticationMW
// const validateEmployee = require("../Core/Validations/validateEmployee");

const router = express.Router();

//get all transactions and add transaction and update borrow transaction to have more time 
router.route("/transactions")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)
  .get(controller.getTransactions)
  .post(validateTransaction.postvalidateTransaction,validateMW,controller.addTransaction)
  .patch(validateTransaction.validateTransaction,controller.updateTransaction)
  .delete(controller.deleteTransaction);

//return transactions
router.route("/transactions/return")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)
  .patch(controller.returnTransaction,validateTransaction.validateTransaction);

//get all transtation for specific employee
router.route("/transactions/employee/:id")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)

  .get(controller.getEmployeeTransactions);

//get all transtation for specific member
router.route("/transactions/member/:id")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)

  .get(controller.getMemberTransactions);

//get all transactions that Overdue
router.route("/transactions/overdue")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)

  .get(controller.getOverdueTransactions);

//get all transactions for specific book
router.route("/transactions/book/:id")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)

  .get(controller.getBookTransactions);

//delete specific transaction by book id and member id
router.route("/transactions/deletebymemberandbookid/:bookId/:memberId")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)

  .delete(validateTransaction.validateTransaction,controller.deleteSpecificTransactionByMemberIdAndBookId);

//delete specific transaction by id
router.route("/transactions/deletebyid/:id")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)
.delete(controller.deleteSpecificTransactionById);

//delete all transaction for specific member 
router.route("/transactions/deletebymemberid/:id")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)
.delete(controller.deleteAllTransactionForSpecificMember);
  
//delete all transaction for specific employee
router.route("/transactions/deletebyemployeeid/:id")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)
.delete(controller.deleteAllTransactionForSpecificEmployee);

//delete all transaction for specific book
router.route("/transactions/deletebybookid/:id")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)
.delete(controller.deleteAllTransactionForSpecificbook);


//check all book that must return to day
router.route("/transactions/checkbook")
.all(authMW.authorizeUser("basicAdmin","admin","employee"), authMW.isActive)
.get(controller.checkBook)

module.exports = router;
