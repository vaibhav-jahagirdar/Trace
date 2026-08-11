import { Router } from "express";
import * as controller from "./technology.controller";

const router = Router();

router.post("/", controller.createTechnology);

router.get("/", controller.listTechnologies);

router.get(
  "/:technologyId",
  controller.getTechnology,
);

router.patch(
  "/:technologyId",
  controller.updateTechnology,
);

router.delete(
  "/:technologyId",
  controller.deleteTechnology,
);

export default router;