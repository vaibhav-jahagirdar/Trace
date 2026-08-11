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
exports.getEvidenceCategory = getEvidenceCategory;
exports.listEvidenceCategories = listEvidenceCategories;
exports.updateEvidenceCategory = updateEvidenceCategory;
exports.deleteEvidenceCategory = deleteEvidenceCategory;
exports.createEvaluationDimension = createEvaluationDimension;
exports.getEvaluationDimension = getEvaluationDimension;
exports.listEvaluationDimensions = listEvaluationDimensions;
exports.updateEvaluationDimension = updateEvaluationDimension;
exports.deleteEvaluationDimension = deleteEvaluationDimension;
exports.createSuccessSignal = createSuccessSignal;
exports.getSuccessSignal = getSuccessSignal;
exports.listSuccessSignals = listSuccessSignals;
exports.updateSuccessSignal = updateSuccessSignal;
exports.deleteSuccessSignal = deleteSuccessSignal;
const repository = __importStar(require("./evaluation-config.repository"));
async function createEvidenceCategory(code, name, description) {
    try {
        return await repository.createEvidenceCategory(code, name, description);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("EVIDENCE_CATEGORY_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function getEvidenceCategory(id) {
    const category = await repository.findEvidenceCategoryById(id);
    if (!category) {
        throw new Error("EVIDENCE_CATEGORY_NOT_FOUND");
    }
    return category;
}
async function listEvidenceCategories(limit, offset, search) {
    return repository.listEvidenceCategories(limit, offset, search);
}
async function updateEvidenceCategory(id, fields) {
    const existing = await repository.findEvidenceCategoryById(id);
    if (!existing) {
        throw new Error("EVIDENCE_CATEGORY_NOT_FOUND");
    }
    if (Object.keys(fields).length === 0) {
        return existing;
    }
    const repositoryFields = {};
    if (fields.code !== undefined) {
        repositoryFields.code = fields.code;
    }
    if (fields.name !== undefined) {
        repositoryFields.name = fields.name;
    }
    if (fields.description !== undefined) {
        repositoryFields.description = fields.description;
    }
    try {
        return await repository.updateEvidenceCategory(id, repositoryFields);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("EVIDENCE_CATEGORY_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function deleteEvidenceCategory(id) {
    try {
        const category = await repository.deleteEvidenceCategory(id);
        if (!category) {
            throw new Error("EVIDENCE_CATEGORY_NOT_FOUND");
        }
        return category;
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23503") {
            throw new Error("EVIDENCE_CATEGORY_IN_USE");
        }
        throw error;
    }
}
async function createEvaluationDimension(code, name, description) {
    try {
        return await repository.createEvaluationDimension(code, name, description);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("EVALUATION_DIMENSION_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function getEvaluationDimension(id) {
    const dimension = await repository.findEvaluationDimensionById(id);
    if (!dimension) {
        throw new Error("EVALUATION_DIMENSION_NOT_FOUND");
    }
    return dimension;
}
async function listEvaluationDimensions(limit, offset, search) {
    return repository.listEvaluationDimensions(limit, offset, search);
}
async function updateEvaluationDimension(id, fields) {
    const existing = await repository.findEvaluationDimensionById(id);
    if (!existing) {
        throw new Error("EVALUATION_DIMENSION_NOT_FOUND");
    }
    if (Object.keys(fields).length === 0) {
        return existing;
    }
    const repositoryFields = {};
    if (fields.code !== undefined) {
        repositoryFields.code = fields.code;
    }
    if (fields.name !== undefined) {
        repositoryFields.name = fields.name;
    }
    if (fields.description !== undefined) {
        repositoryFields.description = fields.description;
    }
    try {
        return await repository.updateEvaluationDimension(id, repositoryFields);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("EVALUATION_DIMENSION_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function deleteEvaluationDimension(id) {
    try {
        const dimension = await repository.deleteEvaluationDimension(id);
        if (!dimension) {
            throw new Error("EVALUATION_DIMENSION_NOT_FOUND");
        }
        return dimension;
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23503") {
            throw new Error("EVALUATION_DIMENSION_IN_USE");
        }
        throw error;
    }
}
async function createSuccessSignal(code, name, description) {
    try {
        return await repository.createSuccessSignal(code, name, description);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("SUCCESS_SIGNAL_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function getSuccessSignal(id) {
    const signal = await repository.findSuccessSignalById(id);
    if (!signal) {
        throw new Error("SUCCESS_SIGNAL_NOT_FOUND");
    }
    return signal;
}
async function listSuccessSignals(limit, offset, search) {
    return repository.listSuccessSignals(limit, offset, search);
}
async function updateSuccessSignal(id, fields) {
    const existing = await repository.findSuccessSignalById(id);
    if (!existing) {
        throw new Error("SUCCESS_SIGNAL_NOT_FOUND");
    }
    if (Object.keys(fields).length === 0) {
        return existing;
    }
    const repositoryFields = {};
    if (fields.code !== undefined) {
        repositoryFields.code = fields.code;
    }
    if (fields.name !== undefined) {
        repositoryFields.name = fields.name;
    }
    if (fields.description !== undefined) {
        repositoryFields.description = fields.description;
    }
    try {
        return await repository.updateSuccessSignal(id, repositoryFields);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("SUCCESS_SIGNAL_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function deleteSuccessSignal(id) {
    try {
        const signal = await repository.deleteSuccessSignal(id);
        if (!signal) {
            throw new Error("SUCCESS_SIGNAL_NOT_FOUND");
        }
        return signal;
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23503") {
            throw new Error("SUCCESS_SIGNAL_IN_USE");
        }
        throw error;
    }
}
//# sourceMappingURL=evaluation-config.service.js.map