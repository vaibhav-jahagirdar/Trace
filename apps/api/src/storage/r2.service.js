"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = uploadResume;
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
const r2_client_1 = require("./r2.client");
const env_1 = require("../config/env");
async function uploadResume({ applicationId, file, }) {
    const sha256 = (0, crypto_2.createHash)("sha256")
        .update(file.buffer)
        .digest("hex");
    const extension = "pdf";
    const objectKey = `applications/${applicationId}/resume-${(0, crypto_1.randomUUID)()}.${extension}`;
    await r2_client_1.r2Client.send(new client_s3_1.PutObjectCommand({
        Bucket: env_1.env.R2_BUCKET,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
    }));
    return {
        objectKey,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        sha256,
    };
}
//# sourceMappingURL=r2.service.js.map