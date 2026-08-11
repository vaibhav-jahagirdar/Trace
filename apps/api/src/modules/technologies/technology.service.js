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
const repository = __importStar(require("./technology.repository"));
async function createTechnology(name, category) {
    try {
        return await repository.createTechnology(name, category);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("TECHNOLOGY_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function getTechnology(id) {
    const technology = await repository.findTechnologyById(id);
    if (!technology) {
        throw new Error("TECHNOLOGY_NOT_FOUND");
    }
    return technology;
}
async function listTechnologies(limit, offset, search, category) {
    return repository.listTechnologies(limit, offset, search, category);
}
async function updateTechnology(id, fields) {
    const existing = await repository.findTechnologyById(id);
    if (!existing) {
        throw new Error("TECHNOLOGY_NOT_FOUND");
    }
    if (Object.keys(fields).length === 0) {
        return existing;
    }
    // Normalize the Zod output before passing it
    // to a repository that uses exactOptionalPropertyTypes.
    const repositoryFields = {};
    if (fields.name !== undefined) {
        repositoryFields.name = fields.name;
    }
    if (fields.category !== undefined) {
        repositoryFields.category = fields.category;
    }
    try {
        return await repository.updateTechnology(id, repositoryFields);
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === "23505") {
            throw new Error("TECHNOLOGY_ALREADY_EXISTS");
        }
        throw error;
    }
}
async function deleteTechnology(id) {
    const technology = await repository.deleteTechnology(id);
    if (!technology) {
        throw new Error("TECHNOLOGY_NOT_FOUND");
    }
    return technology;
}
//# sourceMappingURL=technology.service.js.map