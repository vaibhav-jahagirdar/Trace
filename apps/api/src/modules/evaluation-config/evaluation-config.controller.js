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
exports.createEvidenceCategory = createEvidenceCategory;
exports.listEvidenceCategories = listEvidenceCategories;
exports.getEvidenceCategory = getEvidenceCategory;
exports.updateEvidenceCategory = updateEvidenceCategory;
exports.deleteEvidenceCategory = deleteEvidenceCategory;
exports.createEvaluationDimension = createEvaluationDimension;
exports.listEvaluationDimensions = listEvaluationDimensions;
exports.getEvaluationDimension = getEvaluationDimension;
exports.updateEvaluationDimension = updateEvaluationDimension;
exports.deleteEvaluationDimension = deleteEvaluationDimension;
exports.createSuccessSignal = createSuccessSignal;
exports.listSuccessSignals = listSuccessSignals;
exports.getSuccessSignal = getSuccessSignal;
exports.updateSuccessSignal = updateSuccessSignal;
exports.deleteSuccessSignal = deleteSuccessSignal;
const service = __importStar(require("./evaluation-config.service"));
const evaluation_config_schema_1 = require("./evaluation-config.schema");
function getPagination(req) {
    const rawLimit = Number(req.query.limit ?? 50);
    const rawOffset = Number(req.query.offset ?? 0);
    const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100)
        : 50;
    const offset = Number.isFinite(rawOffset)
        ? Math.max(Math.trunc(rawOffset), 0)
        : 0;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    return {
        limit,
        offset,
        search,
    };
}
async function createEvidenceCategory(req, res) {
    const body = evaluation_config_schema_1.createEvaluationConfigSchema.parse(req.body);
    const category = await service.createEvidenceCategory(body.code, body.name, body.description ?? null);
    res.status(201).json({
        data: category,
    });
}
async function listEvidenceCategories(req, res) {
    const { limit, offset, search } = getPagination(req);
    const categories = await service.listEvidenceCategories(limit, offset, search);
    res.status(200).json({
        data: categories,
    });
}
async function getEvidenceCategory(req, res) {
    const { evidenceCategoryId } = evaluation_config_schema_1.evidenceCategoryIdParamSchema.parse(req.params);
    const category = await service.getEvidenceCategory(evidenceCategoryId);
    res.status(200).json({
        data: category,
    });
}
async function updateEvidenceCategory(req, res) {
    const { evidenceCategoryId } = evaluation_config_schema_1.evidenceCategoryIdParamSchema.parse(req.params);
    const body = evaluation_config_schema_1.updateEvaluationConfigSchema.parse(req.body);
    const category = await service.updateEvidenceCategory(evidenceCategoryId, body);
    res.status(200).json({
        data: category,
    });
}
async function deleteEvidenceCategory(req, res) {
    const { evidenceCategoryId } = evaluation_config_schema_1.evidenceCategoryIdParamSchema.parse(req.params);
    await service.deleteEvidenceCategory(evidenceCategoryId);
    res.status(204).send();
}
async function createEvaluationDimension(req, res) {
    const body = evaluation_config_schema_1.createEvaluationConfigSchema.parse(req.body);
    const dimension = await service.createEvaluationDimension(body.code, body.name, body.description ?? null);
    res.status(201).json({
        data: dimension,
    });
}
async function listEvaluationDimensions(req, res) {
    const { limit, offset, search } = getPagination(req);
    const dimensions = await service.listEvaluationDimensions(limit, offset, search);
    res.status(200).json({
        data: dimensions,
    });
}
async function getEvaluationDimension(req, res) {
    const { evaluationDimensionId } = evaluation_config_schema_1.evaluationDimensionIdParamSchema.parse(req.params);
    const dimension = await service.getEvaluationDimension(evaluationDimensionId);
    res.status(200).json({
        data: dimension,
    });
}
async function updateEvaluationDimension(req, res) {
    const { evaluationDimensionId } = evaluation_config_schema_1.evaluationDimensionIdParamSchema.parse(req.params);
    const body = evaluation_config_schema_1.updateEvaluationConfigSchema.parse(req.body);
    const dimension = await service.updateEvaluationDimension(evaluationDimensionId, body);
    res.status(200).json({
        data: dimension,
    });
}
async function deleteEvaluationDimension(req, res) {
    const { evaluationDimensionId } = evaluation_config_schema_1.evaluationDimensionIdParamSchema.parse(req.params);
    await service.deleteEvaluationDimension(evaluationDimensionId);
    res.status(204).send();
}
async function createSuccessSignal(req, res) {
    const body = evaluation_config_schema_1.createEvaluationConfigSchema.parse(req.body);
    const signal = await service.createSuccessSignal(body.code, body.name, body.description ?? null);
    res.status(201).json({
        data: signal,
    });
}
async function listSuccessSignals(req, res) {
    const { limit, offset, search } = getPagination(req);
    const signals = await service.listSuccessSignals(limit, offset, search);
    res.status(200).json({
        data: signals,
    });
}
async function getSuccessSignal(req, res) {
    const { successSignalId } = evaluation_config_schema_1.successSignalIdParamSchema.parse(req.params);
    const signal = await service.getSuccessSignal(successSignalId);
    res.status(200).json({
        data: signal,
    });
}
async function updateSuccessSignal(req, res) {
    const { successSignalId } = evaluation_config_schema_1.successSignalIdParamSchema.parse(req.params);
    const body = evaluation_config_schema_1.updateEvaluationConfigSchema.parse(req.body);
    const signal = await service.updateSuccessSignal(successSignalId, body);
    res.status(200).json({
        data: signal,
    });
}
async function deleteSuccessSignal(req, res) {
    const { successSignalId } = evaluation_config_schema_1.successSignalIdParamSchema.parse(req.params);
    await service.deleteSuccessSignal(successSignalId);
    res.status(204).send();
}
//# sourceMappingURL=evaluation-config.controller.js.map