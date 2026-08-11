"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.r2Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = __importDefault(require("../config/env"));
exports.r2Client = new client_s3_1.S3Client({
    region: env_1.default.R2_REGION,
    endpoint: env_1.default.R2_ENDPOINT,
    credentials: {
        accessKeyId: env_1.default.R2_ACCESS_KEY_ID,
        secretAccessKey: env_1.default.R2_SECRET_ACCESS_KEY,
    },
});
//# sourceMappingURL=r2.client.js.map