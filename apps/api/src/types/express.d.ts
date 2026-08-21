import type { OrgRole } from "../modules/organizations/orgs.types";

declare global {
  namespace Express {
    interface User {
      id: string;
      sessionId: string;
    }

    interface Request {
      user?: User;
      membership?: {
        id: string;
        organizationId: string;
        userId: string;
        role: OrgRole | string;
        title: string | null;
      };
    }
  }
}

export {};
