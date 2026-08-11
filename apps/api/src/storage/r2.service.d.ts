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
export declare function uploadResume({ applicationId, file, }: UploadResumeInput): Promise<UploadResumeResult>;
//# sourceMappingURL=r2.service.d.ts.map