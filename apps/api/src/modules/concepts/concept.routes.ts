import { Router } from "express";

import * as controller from "./concept.controller";

const router = Router();

router.post("/", controller.createConcept);

router.get("/", controller.listConcepts);

router.get(
  "/:conceptId",
  controller.getConcept,
);

router.patch(
  "/:conceptId",
  controller.updateConcept,
);

router.delete(
  "/:conceptId",
  controller.deleteConcept,
);

export default router;