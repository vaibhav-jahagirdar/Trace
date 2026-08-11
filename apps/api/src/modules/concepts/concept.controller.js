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
exports.createConcept = createConcept;
exports.getConcept = getConcept;
exports.listConcepts = listConcepts;
exports.updateConcept = updateConcept;
exports.deleteConcept = deleteConcept;
const service = __importStar(require("./concept.service"));
const concept_schema_1 = require("./concept.schema");
async function createConcept(req, res) {
    const body = concept_schema_1.createConceptSchema.parse(req.body);
    const concept = await service.createConcept(body.name, body.category ?? null);
    res.status(201).json({
        data: concept,
    });
}
async function getConcept(req, res) {
    const { conceptId } = concept_schema_1.conceptIdParamSchema.parse(req.params);
    const concept = await service.getConcept(conceptId);
    res.status(200).json({
        data: concept,
    });
}
async function listConcepts(req, res) {
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
    const concepts = await service.listConcepts(limit, offset, search, category);
    res.status(200).json({
        data: concepts,
    });
}
async function updateConcept(req, res) {
    const { conceptId } = concept_schema_1.conceptIdParamSchema.parse(req.params);
    const body = concept_schema_1.updateConceptSchema.parse(req.body);
    const concept = await service.updateConcept(conceptId, {
        ...(body.name !== undefined && {
            name: body.name,
        }),
        ...(body.category !== undefined && {
            category: body.category,
        }),
    });
    res.status(200).json({
        data: concept,
    });
}
async function deleteConcept(req, res) {
    const { conceptId } = concept_schema_1.conceptIdParamSchema.parse(req.params);
    await service.deleteConcept(conceptId);
    res.status(204).send();
}
//# sourceMappingURL=concept.controller.js.map