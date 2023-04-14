const multer = require("multer");
const path = require("path");
const { toCapitalCase } = require("../Utilities/utilities");

module.exports = (request, response, next) => {
  multer({
    storage: multer.diskStorage({
      destination: (request, file, callback) => {
        callback(null, path.join(__dirname, "..", "..", "Images", 
          toCapitalCase(request.route.path)
        ));
      }, // Set the destination to the matching entity folder inside Images folder
      filename: (request, file, callback) => {
        console.log(request.body.image+'image')
        console.log('===============================')
        console.log(file.originalname+'file')
        
        callback(null, 'aqzserd'+file.originalname);
      }, // Set filename to the current epoch time (to be unique)
    }),
    fileFilter: (request, file, callback) => {
      if (file.mimetype.startsWith("image/")) callback(null, true);
      else
        callback(
          new Error("Invalid file type, only images are allowed"),
          false
        );
    }, // Set file filter to only accept images
  }).single("image")(request, response, (error) => {
    if (error) {
      next(error);
    } else {
      next();
    }
  });
};
