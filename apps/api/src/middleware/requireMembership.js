"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMembership = requireMembership;
const errorHandler_1 = require("./errorHandler");
const db_1 = require("../config/db");
const errorHandler_2 = require("./errorHandler");
const membershipCheck_1 = require("../helpers/membershipCheck");
function requireMembership(requiredRole) {
    return async (req, _res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new errorHandler_1.UnauthorizedError("Authentication required");
            const orgIdParam = req.params.orgId;
            if (!orgIdParam)
                throw new errorHandler_1.ValidationError("Organization ID is required");
            if (Array.isArray(orgIdParam)) {
                throw new errorHandler_1.ValidationError("Organization ID must be a single value");
            }
            const orgId = orgIdParam;
            const membershipResult = await (0, db_1.getDb)().query(`SELECT id, role, title
         FROM organization_members
         WHERE user_id = $1 AND organization_id = $2 AND removed_at IS NULL`, [userId, orgId]);
            const member = membershipResult.rows[0];
            if (!member)
                throw new errorHandler_1.UnauthorizedError("No active membership found");
            const { id, role, title } = member;
            if (requiredRole && membershipCheck_1.roleHierarchy[role] < membershipCheck_1.roleHierarchy[requiredRole]) {
                throw new errorHandler_2.ForbiddenError("Forbidden: Insufficient role privileges");
            }
            req.membership = { id, organizationId: orgId, userId, role, title };
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=requireMembership.js.map