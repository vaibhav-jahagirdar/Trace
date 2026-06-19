import { AppError } from "../../../middleware/errorHandler";
import { withTransaction } from "../../../config/transaction";

import type { CreateOrganizationInput } from "../orgs.validator";

import { handlePgError } from "../../../utils/postgresErrors";

export async function createOrganization(
  input: CreateOrganizationInput,
  userId: string
) {
  return withTransaction(async (client) => {
    try {
      const {
        slug,
        name,
        description,
        title,
      } = input;

      const createOrgResult =
        await client.query(
          `
          INSERT INTO organizations (
            slug,
            name,
            description,
            created_by
          )
          VALUES (
            $1,
            $2,
            $3,
            $4
          )
          RETURNING id
          `,
          [
            slug,
            name,
            description ?? null,
            userId,
          ]
        );

      const organizationId =
        createOrgResult.rows[0]?.id;

      if (!organizationId) {
        throw new AppError(
          "Failed to create organization",
          500,
          "ORG_CREATION_FAILED"
        );
      }

      const membershipResult =
        await client.query(
          `
          INSERT INTO organization_members (
            organization_id,
            user_id,
            role,
            title,
            invited_by
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
          )
          RETURNING id
          `,
          [
            organizationId,
            userId,
            "ORG_OWNER",
            title ?? null,
            null,
          ]
        );

      const membershipId =
        membershipResult.rows[0]?.id;

      if (!membershipId) {
        throw new AppError(
          "Failed to create organization membership",
          500,
          "ORG_MEMBERSHIP_CREATION_FAILED"
        );
      }

      return {
        organizationId,
        membershipId,
      };
    } catch (error) {
      handlePgError(error);
      throw error;
    }
  });
}