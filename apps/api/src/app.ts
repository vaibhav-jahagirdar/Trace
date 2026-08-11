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
const app = express();

app.use(httpLogger);

app.use(
  cors({
    origin: "http://localhost:3000",
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

app.use(errorHandler);

export default app;
