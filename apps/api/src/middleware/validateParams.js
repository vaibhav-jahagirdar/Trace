"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = validateParams;
const errorHandler_1 = require("./errorHandler");
function validateParams(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            const message = result.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
            return next(new errorHandler_1.ValidationError(message));
        }
        req.params = result.data;
        next();
    };
}
//# sourceMappingURL=validateParams.js.map