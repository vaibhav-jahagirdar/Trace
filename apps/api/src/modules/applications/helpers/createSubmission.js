"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubmissionRecord = createSubmissionRecord;
const errorHandler_1 = require("../../../middleware/errorHandler");
const requirementMap = {
    github_required: "githubUrl",
    linkedin_required: "linkedinUrl",
    problem_solving_profile_required: "problemSolvingProfileUrl",
    project_explanation_required: "projectDescription",
    feature_explanation_required: "featureDescription",
};
async function createSubmissionRecord(submissionData, client, applicationId, jobResult, objectKey, fileName, mimeType, fileSize, sha256) {
    const mandatoryFields = Object.entries(requirementMap)
        .filter(([requirement]) => jobResult.submission_requirements[requirement])
        .map(([, submissionField]) => submissionField);
    const missingFields = mandatoryFields.filter((field) => {
        const value = submissionData[field];
        return (value == null ||
            (typeof value === "string" && value.trim() === ""));
    });
    if (missingFields.length > 0) {
        throw new errorHandler_1.BadRequestError(`Missing required submission fields: ${missingFields.join(", ")}`);
    }
    await client.query(`
      INSERT INTO application_submissions (
        job_application_id,
        github_url,
        portfolio_url,
        linkedin_url,
        problem_solving_profile_url,
        featured_project_name,
        featured_project_url,
        project_description,
        feature_description,
        engineering_highlight,
        best_evidence_note,
        why_you_are_a_good_fit,
        resume_object_key,
        resume_file_name,
        resume_mime_type,
        resume_file_size,
        resume_sha256
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      )
    `, [
        applicationId,
        submissionData.githubUrl ?? null,
        submissionData.portfolioUrl ?? null,
        submissionData.linkedinUrl ?? null,
        submissionData.problemSolvingProfileUrl ?? null,
        submissionData.featuredProjectName ?? null,
        submissionData.featuredProjectUrl ?? null,
        submissionData.projectDescription ?? null,
        submissionData.featureDescription ?? null,
        submissionData.engineeringHighlight ?? null,
        submissionData.bestEvidenceNote ?? null,
        submissionData.whyYouAreAGoodFit ?? null,
        objectKey,
        fileName,
        mimeType,
        fileSize,
        sha256,
    ]);
}
//# sourceMappingURL=createSubmission.js.map