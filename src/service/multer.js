import multer, { diskStorage } from "multer";

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/uploads/`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + " - " + Date.now());
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb({ massege: "Unsupported File Format" }, false);
  }
};

// file maximum size 
const MAX_FILE_SIZE = 1024 * 1024;

export const uploads = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
