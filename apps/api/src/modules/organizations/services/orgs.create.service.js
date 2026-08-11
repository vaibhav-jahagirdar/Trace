"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganization = createOrganization;
const errorHandler_1 = require("../../../middleware/errorHandler");
const transaction_1 = require("../../../config/transaction");
const postgresErrors_1 = require("../../../utils/postgresErrors");
async function createOrganization(input, userId) {
    return (0, transaction_1.withTransaction)(async (client) => {
        try {
            const { slug, name, description, title, } = input;
            const createOrgResult = await client.query(`
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
          `, [
                slug,
                name,
                description ?? null,
                userId,
            ]);
            const organizationId = createOrgResult.rows[0]?.id;
            if (!organizationId) {
                throw new errorHandler_1.AppError("Failed to create organization", 500, "ORG_CREATION_FAILED");
            }
            const membershipResult = await client.query(`
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
          `, [
                organizationId,
                userId,
                "ORG_OWNER",
                title ?? null,
                null,
            ]);
            const membershipId = membershipResult.rows[0]?.id;
            if (!membershipId) {
                throw new errorHandler_1.AppError("Failed to create organization membership", 500, "ORG_MEMBERSHIP_CREATION_FAILED");
            }
            return {
                organizationId,
                membershipId,
            };
        }
        catch (error) {
            (0, postgresErrors_1.handlePgError)(error);
            throw error;
        }
    });
}
//# sourceMappingURL=orgs.create.service.js.map