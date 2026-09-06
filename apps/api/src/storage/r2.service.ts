

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { r2Client } from "./r2.client";
import { env } from "../config/env";

export interface UploadResumeInput {
  applicationId: string;
  file: Express.Multer.File;
}

export interface UploadResumeResult {
  objectKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  sha256: string;
}

export async function uploadResume({
  applicationId,
  file,
}: UploadResumeInput): Promise<UploadResumeResult> {
   const sha256 = createHash("sha256")
    .update(file.buffer)
    .digest("hex");

  const extension = "pdf";

  const objectKey = `applications/${applicationId}/resume-${randomUUID()}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    }),
  );

  return {
    objectKey,
    fileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    sha256,

  };
}

export async function createResumeViewUrl(objectKey: string): Promise<string> {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: objectKey,
      ResponseContentType: "application/pdf",
      ResponseContentDisposition: "inline",
    }),
    { expiresIn: 300 },
  );
}

export async function getResumeObject(objectKey: string) {
  return r2Client.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: objectKey }));
}

