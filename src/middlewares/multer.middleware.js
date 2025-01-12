import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'tmp/'); // Specify the upload folder
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname); 
      const fileName = Date.now() + fileExtension; 
      cb(null, fileName); 
    }
});

export const upload = multer({ storage });