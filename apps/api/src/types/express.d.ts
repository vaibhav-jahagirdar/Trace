import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sessionId: string;
      };
      membership?: {
        id: string;
        organizationId: string;
        userId: string;
        role: OrgRole;
        title: string | null;
      };
    }
  }
}

export {};