//required express-validator
const { body, param } = require("express-validator");



//validate transAction 
exports.postvalidateTransaction = [
    body("bookId").isNumeric().withMessage("bookId must be number")
    .notEmpty().withMessage("bookId must not be empty"),
    body("memberId").isNumeric().withMessage("memberId must be number")
    .notEmpty().withMessage("memberId must not be empty"),
                                         /** we dont need it because will set from jwt not request.body */
                                // body("employeeId").isNumeric().withMessage("employeeId must be number")
                                // .notEmpty().withMessage("employeeId must not be empty"),
    body("status").isIn(["read", "borrow"]).withMessage("status must be read or borrow")
    .notEmpty().withMessage("status must not be empty"),    
];

//validate return transactions
exports.validateTransaction = [
    body("bookId").isNumeric().withMessage("bookId must be number")
    .notEmpty().withMessage("bookId must not be empty"),
    body("memberId").isNumeric().withMessage("memberId must be number")
    .notEmpty().withMessage("memberId must not be empty"),
];






    