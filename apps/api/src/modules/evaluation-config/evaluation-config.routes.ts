import { Router } from "express";

import * as controller from "./evaluation-config.controller";

const router = Router();

router.post("/evidence-categories", controller.createEvidenceCategory);

router.get("/evidence-categories", controller.listEvidenceCategories);

router.get(
  "/evidence-categories/:evidenceCategoryId",
  controller.getEvidenceCategory,
);

router.patch(
  "/evidence-categories/:evidenceCategoryId",
  controller.updateEvidenceCategory,
);

router.delete(
  "/evidence-categories/:evidenceCategoryId",
  controller.deleteEvidenceCategory,
);

router.post("/evaluation-dimensions", controller.createEvaluationDimension);

router.get("/evaluation-dimensions", controller.listEvaluationDimensions);

router.get(
  "/evaluation-dimensions/:evaluationDimensionId",
  controller.getEvaluationDimension,
);

router.patch(
  "/evaluation-dimensions/:evaluationDimensionId",
  controller.updateEvaluationDimension,
);

router.delete(
  "/evaluation-dimensions/:evaluationDimensionId",
  controller.deleteEvaluationDimension,
);

router.post("/success-signals", controller.createSuccessSignal);

router.get("/success-signals", controller.listSuccessSignals);

router.get("/success-signals/:successSignalId", controller.getSuccessSignal);

router.patch(
  "/success-signals/:successSignalId",
  controller.updateSuccessSignal,
);

router.delete(
  "/success-signals/:successSignalId",
  controller.deleteSuccessSignal,
);

export default router;
