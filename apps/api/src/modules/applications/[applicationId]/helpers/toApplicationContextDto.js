"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toApplicationContextDto = toApplicationContextDto;
function toApplicationContextDto(application, technologies, concepts) {
    return {
        candidateProfile: {
            yearsOfProfessionalExperience: Number(application.years_of_professional_experience),
            highestEducationLevel: application.highest_education_level,
        },
        submittedEvidence: {
            resumeProvided: application.resume_object_key !== null,
            githubUrl: application.github_url,
            portfolioUrl: application.portfolio_url,
            linkedinUrl: application.linkedin_url,
            problemSolvingProfileUrl: application.problem_solving_profile_url,
            featuredProjectName: application.featured_project_name,
            featuredProjectUrl: application.featured_project_url,
            projectDescription: application.project_description,
            featureDescription: application.feature_description,
            engineeringHighlight: application.engineering_highlight,
            bestEvidenceNote: application.best_evidence_note,
            whyGoodFit: application.why_you_are_a_good_fit,
        },
        claimedTechnologies: technologies,
        claimedConcepts: concepts,
    };
}
//# sourceMappingURL=toApplicationContextDto.js.map