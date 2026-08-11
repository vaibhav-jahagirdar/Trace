"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePgError = handlePgError;
const errorHandler_1 = require("../middleware/errorHandler");
function handlePgError(err) {
    if (err.code === "23505") {
        if (err.constraint === "users_email_key")
            throw new errorHandler_1.AppError("Email already in use", 409, "EMAIL_TAKEN");
        if (err.constraint === "users_username_key")
            throw new errorHandler_1.AppError("Username already taken", 409, "USERNAME_TAKEN");
        if (err.constraint === "organizations_slug_key")
            throw new errorHandler_1.AppError("Slug already taken", 409, "SLUG_TAKEN");
    }
    throw err;
}
//# sourceMappingURL=postgresErrors.js.map