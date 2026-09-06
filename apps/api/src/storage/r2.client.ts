

import { S3Client } from "@aws-sdk/client-s3";
import env from "../config/env";



export const r2Client = new S3Client({
  region: env.R2_REGION, 

  // R2 does not support the SDK's optional checksum query parameter on
  // presigned GetObject URLs. Only calculate checksums when explicitly required.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",

  endpoint: env.R2_ENDPOINT,

  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});
