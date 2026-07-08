

import { BadRequestError } from "../middleware/errorHandler";

const PDF_MAGIC_BYTES = "%PDF-";

const MAX_RESUME_SIZE = 5 * 1024 * 1024; 

export function validateResumeFile(file?: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestError("Resume is required.");
  }

  if (file.size === 0) {
    throw new BadRequestError("Resume file is empty.");
  }

  if (file.size > MAX_RESUME_SIZE) {
    throw new BadRequestError("Resume exceeds the maximum allowed size of 5 MB.");
  }

  if (file.mimetype !== "application/pdf") {
    throw new BadRequestError("Only PDF resumes are allowed.");
  }

  const magicBytes = file.buffer
    .subarray(0, PDF_MAGIC_BYTES.length)
    .toString("ascii");

  if (magicBytes !== PDF_MAGIC_BYTES) {
    throw new BadRequestError("Invalid PDF file.");
  }
}