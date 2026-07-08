

import multer from "multer";

const MAX_RESUME_SIZE = 5 * 1024 * 1024; 

export const uploadResume = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
  },

  fileFilter: (_req, file, cb) => {
    if (file.fieldname !== "resume") {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }

    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF resumes are allowed."));
    }

    cb(null, true);
  },
}).single("resume");