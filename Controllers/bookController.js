//import bookschema
const bookSchema = require('./../Models/bookModel');
//import mongoose
const mongoose = require('mongoose');
//require transaction
require('./../Models/transactionModel');

//require paht
const path = require('path');
//get transactionfrom mongoose.model
const transactionSchema = mongoose.model('transactions');

//add new book 
exports.addNewBook = (req, res,next) => {
    //check if req.body.NoOfCopies > 0
    if (req.body.NoOfCopies <= 0) {
        return res.status(400).json({
            message: 'NoOfCopies must be greater than 0'
        });
    }
    //check if  Book Pages > 0
    if (req.body.pages <= 0) {
        return res.status(400).json({
            message: 'Book Pages must be greater than 0'
        });
    }
    //check if PublishingDate not greating than now
    if (req.body.PublishingDate > Date.now()) {
        return res.status(400).json({
            message: 'PublishingDate not True'
        });
    }
    //image_path == relative path
    const image_path = req.file.path.replace(/\\/g, "/");
    //console
    //console.log(req);

    //image_name == image name
    const image_name = req.file.originalname;
    //image_url == absolute path
    const image_url = req.protocol + "://" + req.get("host") + "/" + image_path;
    //absulute path
    const absolutePath = path.join(__dirname, '..', 'images/Book', 'aqzserd'+image_name);
    

    //create new book
    const newBook = new bookSchema({
        title: req.body.title,
        auther: req.body.auther,
        publisher: req.body.publisher,
        PublishingDate: req.body.PublishingDate,
        Category: req.body.Category,
        Edition: req.body.Edition,
        pages: req.body.pages,
        NoOfCopies: req.body.NoOfCopies,
        Avilable: req.body.NoOfCopies,
        shelfNo: req.body.shelfNo,
        image: absolutePath
    });
    //save book
    newBook.save().then(() => {
        res.status(201).json({
            message: 'Book Added Successfully'
        });
    }).catch((error) => next(error));
}



exports.getImage = (req, res, next) => {
    //get image name from req.params
    const imageName = req.params.imagename;
    //sendfile with this name
    res.status(200).sendFile(path.join(__dirname, '..', 'images/Book', imageName));
};


//delete all book
exports.deleteAllBook = (req, res,next) => {
    //delete all books
    bookSchema.deleteMany({}).then(() => {
        res.status(200).json({
            message: 'All Books Deleted Successfully'
        });
    }).catch((error) => next(error));
}


//update book by id
exports.updateBookById = (req, res,next) => {
    
    bookSchema.findById(req.params.id).then((book) => {
        if (!book) {
            return res.status(404).json({
                message: 'Book Not Found'
            });
        }
        // check if Book Pages > 0
        if (req.body.pages <= 0) {
            return res.status(400).json({
                message: 'Book Pages must be greater than 0'
            });
        }
        // check if PublishingDate not greating than now
        if (req.body.PublishingDate > Date.now()) {
            return res.status(400).json({
                message: 'PublishingDate not True'
            });
        }
        // get avilable number of this  book
        let available = book.Avilable;
        // get noOfCopies
        let noOfCopies = book.NoOfCopies;

        // get noofcopies - avilable
        let diff = noOfCopies - available;
        // check if req.body.NoOfCopies > available
        if (req.body.NoOfCopies >= diff) {
            // set new avilable number
            available = available + (req.body.NoOfCopies - noOfCopies);
            bookSchema.updateOne(
                { _id: req.params.id },
                {
                    $set: {
                        title: req.body.title,
                        auther: req.body.auther,
                        publisher: req.body.publisher,
                        PublishingDate: req.body.PublishingDate,
                        Category: req.body.Category,
                        Edition: req.body.Edition,
                        pages: req.body.pages,
                        NoOfCopies: req.body.NoOfCopies,
                        Avilable: available,
                        shelfNo: req.body.shelfNo
                    }
                }
            )
       .then(() => {
            res.status(200).json({
                message: 'Book Updated Successfully'
            });
        }).catch((error) => next(error));
        }
        
        else {
            //throw error can't update to this number of copies
            return res.status(400).json({
                message: 'NoOfCopies must be greater than Avilable'
            });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Finding Book'
        });
    });
}


// delete book by id
exports.deleteBookById = (req, res) => {
    
    bookSchema.findOne({_id:req.params.id}).then((book) => {
        if (!book) {
            return res.status(404).json({
                message: 'Book Not Found'
            });
        }
    //check if there are any copies borrowed or read
        transactionSchema.find({ bookId: req.params.id, isReturned: false }).then((transactions) => {
            if (transactions.length > 0) {
                return res.status(400).json({
                    message: 'Can\'t Delete this Book before return all copies'
                });
            } else {
                bookSchema.deleteOne({ _id: req.params.id }).then(() => {
                    res.status(200).json({
                        message: 'Book Deleted Successfully'
                    });
                }).catch((error) => next(error));
            }
        }).catch((err) => {
            res.status(500).json({
                message: 'Error in Finding Book1'
            });
        });
    }
    ).catch((err) => {
        res.status(500).json({
            error:err.message,
            message: 'Error in Finding Book'
        });
    }
    );
}



//get all books
exports.getAllBooks = (req, res) => {
    bookSchema.find().then((books) => {
        books.forEach(book => {
            if(book.image)
            //set image as localhost:port/book/image/imagename
            book.image = req.protocol + "://" + req.get("host") + "/book/image/" + book.image.split('\\').pop();
        });
        res.status(200).json({
            books: books
        });
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Books'
        });
    });
}

//get book by id
exports.getBookById = (req, res) => {
    bookSchema.findById(req.params.id).then((book) => {
        if (book) {
            if(book.image)
            book.image = req.protocol + "://" + req.get("host") + "/book/image/" + book.image.split('\\').pop();
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Book'
        });
    });
}

//get related book that category == book category that send his id in params
exports.getRelatedBook = (req, res) => {
    bookSchema.findById(req.params.id).then((book) => {
        if (book) {
            bookSchema.find(
                { Category: book.Category, _id: { $ne: req.params.id } }
            )
                .then((books) => {
                    if (books) {
                        //return 3 book
                        if(book.image)
                        book.image = req.protocol + "://" + req.get("host") + "/book/image/" + book.image.split('\\').pop();            
                        res.status(200).json(books.slice(0, 3));
                    } else {
                        res.status(404).json({ message: 'Books not found' });
                    }
                }).catch((err) => {
                    res.status(500).json({
                        message: 'Error in Fetching Books'
                    });
                });
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Book'
        });
    });
}

//get book by auther


//get category but not repeted
exports.getCategory = (req, res) => {
    bookSchema.find().distinct('Category').then((category) => {
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Category'
        });
    });
}




//not required
// //get book by auther and publisher
// exports.getBookByAutherAndPublisher = (req, res) => {
//     bookSchema.find({ auther: req.params.auther, publisher: req.params.publisher }).then((book) => {
//         if (book) {
//             res.status(200).json(book);
//         } else {
//             res.status(404).json({ message: 'Book not found' });
//         }
//     }).catch((err) => {
//         res.status(500).json({
//             message: 'Error in Fetching Book'
//         });
//     });
// }


// get book by title
exports.getBookByTitle = (req, res) => {
    const titleRegex = new RegExp(req.params.title, 'i'); 
    bookSchema.find({ title: titleRegex }).then((books) => {
        if (books.length > 0) {
            res.status(200).json(books);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Book'
        });
    });
}

//get book by category
exports.getBookByCategory = (req, res) => {
    bookSchema.find({ Category: req.params.category }).then((book) => {
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Book'
        });
    });
}

//get book by publisher
exports.getBookByPublisher = (req, res) => {
    bookSchema.find({ publisher: req.params.publisher }).then((book) => {
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Book'
        });
    });
}

//get book by auther
exports.getBookByAuther = (req, res) => {
    bookSchema.find({ auther: req.params.auther }).then((book) => {
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Book'
        });
    });
}


//get all avilable book
exports.getAllAvilableBook = (req, res) => {
    bookSchema.find().then((books) => {
        let avilableBook = [];
        // push object in the array this object will contain book and status == "avilable to reed"
        books.forEach((book) => {
            if (book.Avilable > 1) {
                avilableBook.push({ book: book, status: "avilable to read and borrow" });
            }
            else if (book.Avilable == 1) {
                avilableBook.push({ book: book, status: "avilable to read" });
            }
        });
        res.status(200).json({
            message: 'Avilable Book fetched successfully',
            avilableBook: avilableBook
        });
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Avilable Book'
        });
    });
}

//get all publisher
exports.getAllPublisher = (req, res) => {
    bookSchema.find().then((books) => {
        let publisher = [];
        books.forEach((book) => {
            if (!publisher.includes(book.publisher)) {
                publisher.push(book.publisher);
            }
        });
        res.status(200).json({
            message: 'Publisher fetched successfully',
            publisher: publisher
        });
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Publisher'
        });
    });
}


//get all auther
exports.getAllAuther = (req, res) => {
    bookSchema.find().then((books) => {
        let auther = [];
        books.forEach((book) => {
            if (!auther.includes(book.auther)) {
                auther.push(book.auther);
            }
        });
        res.status(200).json({
            message: 'Auther fetched successfully',
            auther: auther
        });
    }).catch((err) => {
        res.status(500).json({
            message: 'Error in Fetching Auther'
        });
    });
}



