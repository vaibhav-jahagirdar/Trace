import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { errorHandler } from "./middleware/errorHandler";
import { httpLogger } from "./middleware/logger";
import authRouter from "./modules/auth/auth.routes";

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

app.use(errorHandler);

export default app;