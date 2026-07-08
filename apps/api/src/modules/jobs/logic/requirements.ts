import { getDb } from "../../../config/db";
import { JOB_ROLE_POLICY, type JobRole } from "../constants/jobPolicy";
import { REQUIREMENT_BUCKETS } from "../constants/jobPolicy";
import type {
  JobRequirementInput,
  JobRequirementsInput,
} from "../validators/create/jobs.validator";
import {
  NotFoundError,
  ValidationError,
} from "../../../middleware/errorHandler";

const pool = getDb();

export type WeightedJobRequirementInput =
  JobRequirementInput & {
    weight: number;
  };

export async function getRole(
  roleCategoryId: string,
): Promise<JobRole> {
  const result = await pool.query<{
    code: JobRole;
  }>(
    `
      SELECT code
      FROM job_role_categories
      WHERE id = $1
    `,
    [roleCategoryId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError(
      `Role category ${roleCategoryId} not found`,
    );
  }

  return result.rows[0]!.code;
}

export function processJobRequirements(
  role: JobRole,
  requirements: JobRequirementsInput,
): WeightedJobRequirementInput[] {
  if (requirements.length === 0) {
    throw new ValidationError(
      "At least one requirement must be provided.",
    );
  }

  const roleLimits = JOB_ROLE_POLICY[role].requirements;

  let mandatoryCount = 0;
  let preferredCount = 0;
  let bonusCount = 0;

  const technologyIds = new Set<string>();
  const conceptIds = new Set<string>();

  for (const requirement of requirements) {
    switch (requirement.priority_type) {
      case "MANDATORY":
        mandatoryCount++;
        break;

      case "PREFERRED":
        preferredCount++;
        break;

      case "BONUS":
        bonusCount++;
        break;
    }

    if (requirement.requirement_type === "TECHNOLOGY") {
      if (technologyIds.has(requirement.technology_id)) {
        throw new ValidationError(
          "Duplicate technology requirements are not allowed.",
        );
      }

      technologyIds.add(requirement.technology_id);
    }

    if (requirement.requirement_type === "CONCEPT") {
      if (conceptIds.has(requirement.concept_id)) {
        throw new ValidationError(
          "Duplicate concept requirements are not allowed.",
        );
      }

      conceptIds.add(requirement.concept_id);
    }
  }


  if (preferredCount === 0) {
    throw new ValidationError(
      "At least one preferred requirement is required.",
    );
  }

  if (mandatoryCount > roleLimits.mandatory) {
    throw new ValidationError(
      `Maximum ${roleLimits.mandatory} mandatory requirements are allowed for ${role}.`,
    );
  }

  if (mandatoryCount > 0) {
    if (preferredCount > roleLimits.preferred) {
      throw new ValidationError(
        `Maximum ${roleLimits.preferred} preferred requirements are allowed for ${role}.`,
      );
    }
  } else {
    if (
      preferredCount >
      roleLimits.preferredWithoutMandatory
    ) {
      throw new ValidationError(
        `Maximum ${roleLimits.preferredWithoutMandatory} preferred requirements are allowed when no mandatory requirements are selected.`,
      );
    }
  }

  if (bonusCount > roleLimits.bonus) {
    throw new ValidationError(
      `Maximum ${roleLimits.bonus} bonus requirements are allowed for ${role}.`,
    );
  }


  let bucket;

  if (mandatoryCount > 0 && bonusCount > 0) {
    bucket = REQUIREMENT_BUCKETS.WITH_MANDATORY;
  } else if (mandatoryCount > 0 && bonusCount === 0) {
    bucket = REQUIREMENT_BUCKETS.WITHOUT_BONUS;
  } else if (mandatoryCount === 0 && bonusCount > 0) {
    bucket = REQUIREMENT_BUCKETS.WITHOUT_MANDATORY;
  } else {
    bucket = REQUIREMENT_BUCKETS.ONLY_PREFERRED;
  }



  const mandatoryWeight =
    mandatoryCount > 0
      ? bucket.MANDATORY / mandatoryCount
      : 0;

  const preferredWeight =
    preferredCount > 0
      ? bucket.PREFERRED / preferredCount
      : 0;

  const bonusWeight =
    bonusCount > 0
      ? bucket.BONUS / bonusCount
      : 0;

  return requirements.map((requirement) => {
    switch (requirement.priority_type) {
      case "MANDATORY":
        return {
          ...requirement,
          weight: mandatoryWeight,
        };

      case "PREFERRED":
        return {
          ...requirement,
          weight: preferredWeight,
        };

      case "BONUS":
        return {
          ...requirement,
          weight: bonusWeight,
        };

      default:
        throw new ValidationError(
          "Invalid requirement priority.",
        );
        
    }
  });
}