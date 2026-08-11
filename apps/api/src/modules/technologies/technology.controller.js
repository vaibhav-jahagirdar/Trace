"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTechnology = createTechnology;
exports.getTechnology = getTechnology;
exports.listTechnologies = listTechnologies;
exports.updateTechnology = updateTechnology;
exports.deleteTechnology = deleteTechnology;
const service = __importStar(require("./technology.service"));
const technology_schema_1 = require("./technology.schema");
async function createTechnology(req, res) {
    const body = technology_schema_1.createTechnologySchema.parse(req.body);
    const technology = await service.createTechnology(body.name, body.category ?? null);
    res.status(201).json({
        data: technology,
    });
}
async function getTechnology(req, res) {
    const { technologyId } = technology_schema_1.technologyIdParamSchema.parse(req.params);
    const technology = await service.getTechnology(technologyId);
    res.status(200).json({
        data: technology,
    });
}
async function listTechnologies(req, res) {
    const rawLimit = Number(req.query.limit ?? 50);
    const rawOffset = Number(req.query.offset ?? 0);
    const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100)
        : 50;
    const offset = Number.isFinite(rawOffset)
        ? Math.max(Math.trunc(rawOffset), 0)
        : 0;
    const search = typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;
    const category = typeof req.query.category === "string"
        ? req.query.category.trim()
        : undefined;
    const technologies = await service.listTechnologies(limit, offset, search, category);
    res.status(200).json({
        data: technologies,
    });
}
async function updateTechnology(req, res) {
    const { technologyId } = technology_schema_1.technologyIdParamSchema.parse(req.params);
    const body = technology_schema_1.updateTechnologySchema.parse(req.body);
    const technology = await service.updateTechnology(technologyId, {
        ...(body.name !== undefined && {
            name: body.name,
        }),
        ...(body.category !== undefined && {
            category: body.category,
        }),
    });
    res.status(200).json({
        data: technology,
    });
}
async function deleteTechnology(req, res) {
    const { technologyId } = technology_schema_1.technologyIdParamSchema.parse(req.params);
    await service.deleteTechnology(technologyId);
    res.status(204).send();
}
//# sourceMappingURL=technology.controller.js.map