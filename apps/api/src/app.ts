
import express from "express";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/errorHandler";
import { httpLogger } from "./middleware/logger";

const app = express();

app.use(httpLogger); 
app.use(express.json());
app.use(cookieParser());



app.use(errorHandler); 
export default app;