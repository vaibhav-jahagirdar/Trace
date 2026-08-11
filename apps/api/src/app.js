"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./middleware/logger");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const orgs_routes_1 = __importDefault(require("./modules/organizations/orgs.routes"));
const jobRoleCategory_routes_1 = __importDefault(require("./modules/jobRoleCategories/routes/jobRoleCategory.routes"));
const concept_routes_1 = __importDefault(require("./modules/concepts/concept.routes"));
const technology_routes_1 = __importDefault(require("./modules/technologies/technology.routes"));
const evaluation_config_routes_1 = __importDefault(require("./modules/evaluation-config/evaluation-config.routes"));
const jobs_route_1 = __importDefault(require("./modules/jobs/jobs.route"));
const app = (0, express_1.default)();
app.use(logger_1.httpLogger);
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/organizations", orgs_routes_1.default);
app.use("/api/job-role-categories", jobRoleCategory_routes_1.default);
app.use("/api/v1/concepts", concept_routes_1.default);
app.use("/api/v1/technologies", technology_routes_1.default);
app.use("/api/v1", evaluation_config_routes_1.default);
app.use("/api/organizations/:orgId/jobs", jobs_route_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map