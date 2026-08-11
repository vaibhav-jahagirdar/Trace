"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleHierarchy = void 0;
exports.getActiveMembership = getActiveMembership;
exports.assertMinimumRole = assertMinimumRole;
const db_1 = require("../config/db");
const errorHandler_1 = require("../middleware/errorHandler");
exports.roleHierarchy = {
    VIEWER: 0,
    INTERVIEWER: 1,
    HIRING_MANAGER: 2,
    RECRUITER: 3,
    RECRUITING_ADMIN: 4,
    ORG_OWNER: 5,
};
async function getActiveMembership(userId, organizationId, client) {
    const db = client ?? (0, db_1.getDb)();
    const result = await db.query(`
    SELECT
      id,
      user_id,
      organization_id,
      role,
      title
    FROM organization_members
    WHERE user_id = $1
      AND organization_id = $2
      AND removed_at IS NULL
    `, [userId, organizationId]);
    const membership = result.rows[0];
    if (!membership) {
        throw new errorHandler_1.UnauthorizedError("No active membership found");
    }
    return membership;
}
function assertMinimumRole(role, minimumRole) {
    if (exports.roleHierarchy[role] <
        exports.roleHierarchy[minimumRole]) {
        throw new errorHandler_1.ForbiddenError("Insufficient role privileges");
    }
}
//# sourceMappingURL=membershipCheck.js.map