"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = void 0;
const multer_1 = __importDefault(require("multer"));
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
exports.uploadResume = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: MAX_RESUME_SIZE,
        files: 1,
    },
    fileFilter: (_req, file, cb) => {
        if (file.fieldname !== "resume") {
            return cb(new multer_1.default.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
        }
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF resumes are allowed."));
        }
        cb(null, true);
    },
}).single("resume");
//# sourceMappingURL=upload.js.map