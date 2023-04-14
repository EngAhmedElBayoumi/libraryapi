//import express
const express = require('express');
//import book controller
const bookController = require('./../Controllers/bookController');
//import validateMW
const validateMW = require('./../Core/Validations/validateMW');
//import bookvalidator
const bookValidator = require('./../Core/Validations/validateBook');
//create router
const router = express.Router();
//import authMW
const authMW = require("../Middlewares/authMW"); 
const multerMW = require("../Core/Multer/multerMW");


//add new book
router.route('/Book')
    .post(multerMW,bookValidator.postValidator,validateMW,bookController.addNewBook)
    .get(bookController.getAllBooks);


//get image
router.route('/book/image/:imagename')
    .get(bookController.getImage);

//get , update and delete book by id
router.route('/book/byid/:id')
    .get(bookValidator.getByIdValidator,validateMW,bookController.getBookById)
    .patch(bookValidator.updateValidator,validateMW,bookController.updateBookById)
    .delete(bookValidator.getByIdValidator,validateMW,bookController.deleteBookById);


//get related book
router.route('/book/related/:id')
    .get(bookController.getRelatedBook);



//get book by title
router.route('/book/searchbytitle/:title')
    .get(authMW.authorizeUser("basicAdmin","admin","employee","member")
    ,bookValidator.getByTitleValidator,validateMW,bookController.getBookByTitle);

//getCategory
router.route('/bookCategory')
    .get(bookController.getCategory)


//get book by category
router.route('/book/searchbycategory/:category')
    .get(authMW.authorizeUser("basicAdmin","admin","employee","member")
        ,bookValidator.getByCategoryValidator,validateMW,bookController.getBookByCategory);

//get book by auther
router.route('/book/searchbyauther/:auther')
    .get(authMW.authorizeUser("basicAdmin","admin","employee","member")
    ,bookController.getBookByAuther);

//get book by publisher
router.route('/book/searchbypublisher/:publisher')
    .get(authMW.authorizeUser("basicAdmin","admin","employee","member")
    ,bookController.getBookByPublisher);


//not required
//get book by auther and publisher
// router.route('/book/:auther/:publisher')
//     .get(bookValidator.getByAutherAndPublisherValidator,validateMW,bookController.getBookByAutherAndPublisher);


// get all avilable book
router.route('/book/avilable')
    .get(authMW.authorizeUser("basicAdmin","admin","employee","member")
    ,bookController.getAllAvilableBook);

//get all publisher
router.route('/book/publisher')
    .get(authMW.authorizeUser("basicAdmin","admin","employee","member")
    ,bookController.getAllPublisher);


//get all auther
router.route('/book/auther')
    .get(authMW.authorizeUser("basicAdmin","admin","employee","member")
    ,bookController.getAllAuther);



//delete all book
router.route('/book/deleteall')
    .delete(bookController.deleteAllBook);



//export router
module.exports = router;
