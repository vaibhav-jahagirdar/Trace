import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { errorHandler } from "./middleware/errorHandler";
import { httpLogger } from "./middleware/logger";
import authRouter from "./modules/auth/auth.routes";
import orgRouter from "./modules/organizations/orgs.routes";
import jobRoleCategoryRouter from "./modules/jobRoleCategories/routes/jobRoleCategory.routes";
import conceptRoutes from "./modules/concepts/concept.routes";
import technologyRoutes from "./modules/technologies/technology.routes";
import evaluationConfigRoutes from "./modules/evaluation-config/evaluation-config.routes";
import jobsRouter from "./modules/jobs/jobs.route";
import applicationsApplyRouter from "./modules/applications/apply/jobs.apply.route";
const app = express();

app.use(httpLogger);

const allowedOrigins = new Set([
  "https://trace.azurewebsites.net",
  "https://trace-qkj5hxtg3-stakevaibhav35-7455s-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/organizations", orgRouter);
app.use("/api/job-role-categories", jobRoleCategoryRouter);
app.use("/api/v1/concepts", conceptRoutes);
app.use("/api/v1/technologies", technologyRoutes);
app.use("/api/v1", evaluationConfigRoutes);
app.use("/api/organizations/:orgId/jobs", jobsRouter);
app.use("/api", applicationsApplyRouter);

app.use(errorHandler);

export default app;
