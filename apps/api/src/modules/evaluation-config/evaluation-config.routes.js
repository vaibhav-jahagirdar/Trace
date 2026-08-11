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
const express_1 = require("express");
const controller = __importStar(require("./evaluation-config.controller"));
const router = (0, express_1.Router)();
router.post("/evidence-categories", controller.createEvidenceCategory);
router.get("/evidence-categories", controller.listEvidenceCategories);
router.get("/evidence-categories/:evidenceCategoryId", controller.getEvidenceCategory);
router.patch("/evidence-categories/:evidenceCategoryId", controller.updateEvidenceCategory);
router.delete("/evidence-categories/:evidenceCategoryId", controller.deleteEvidenceCategory);
router.post("/evaluation-dimensions", controller.createEvaluationDimension);
router.get("/evaluation-dimensions", controller.listEvaluationDimensions);
router.get("/evaluation-dimensions/:evaluationDimensionId", controller.getEvaluationDimension);
router.patch("/evaluation-dimensions/:evaluationDimensionId", controller.updateEvaluationDimension);
router.delete("/evaluation-dimensions/:evaluationDimensionId", controller.deleteEvaluationDimension);
router.post("/success-signals", controller.createSuccessSignal);
router.get("/success-signals", controller.listSuccessSignals);
router.get("/success-signals/:successSignalId", controller.getSuccessSignal);
router.patch("/success-signals/:successSignalId", controller.updateSuccessSignal);
router.delete("/success-signals/:successSignalId", controller.deleteSuccessSignal);
exports.default = router;
//# sourceMappingURL=evaluation-config.routes.js.map