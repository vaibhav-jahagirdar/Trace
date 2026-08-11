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
const repository = __importStar(require("./concept.repository"));
async function createConcept(name, category) {
    try {
        return await repository.createConcept(name, category);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("CONCEPT_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function getConcept(id) {
    const concept = await repository.findConceptById(id);
    if (!concept) {
        throw new Error("CONCEPT_NOT_FOUND");
    }
    return concept;
}
async function listConcepts(limit, offset, search, category) {
    return repository.listConcepts(limit, offset, search, category);
}
async function updateConcept(id, fields) {
    const existing = await repository.findConceptById(id);
    if (!existing) {
        throw new Error("CONCEPT_NOT_FOUND");
    }
    if (Object.keys(fields).length === 0) {
        return existing;
    }
    const repositoryFields = {};
    if (fields.name !== undefined) {
        repositoryFields.name = fields.name;
    }
    if (fields.category !== undefined) {
        repositoryFields.category = fields.category;
    }
    try {
        return await repository.updateConcept(id, repositoryFields);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("CONCEPT_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function deleteConcept(id) {
    const concept = await repository.deleteConcept(id);
    if (!concept) {
        throw new Error("CONCEPT_NOT_FOUND");
    }
    return concept;
}
//# sourceMappingURL=concept.service.js.map