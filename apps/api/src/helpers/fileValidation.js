"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResumeFile = validateResumeFile;
const errorHandler_1 = require("../middleware/errorHandler");
const PDF_MAGIC_BYTES = "%PDF-";
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
function validateResumeFile(file) {
    if (!file) {
        throw new errorHandler_1.BadRequestError("Resume is required.");
    }
    if (file.size === 0) {
        throw new errorHandler_1.BadRequestError("Resume file is empty.");
    }
    if (file.size > MAX_RESUME_SIZE) {
        throw new errorHandler_1.BadRequestError("Resume exceeds the maximum allowed size of 5 MB.");
    }
    if (file.mimetype !== "application/pdf") {
        throw new errorHandler_1.BadRequestError("Only PDF resumes are allowed.");
    }
    const magicBytes = file.buffer
        .subarray(0, PDF_MAGIC_BYTES.length)
        .toString("ascii");
    if (magicBytes !== PDF_MAGIC_BYTES) {
        throw new errorHandler_1.BadRequestError("Invalid PDF file.");
    }
}
//# sourceMappingURL=fileValidation.js.map