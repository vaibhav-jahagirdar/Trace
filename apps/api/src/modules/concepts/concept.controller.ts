import { Request, Response } from "express";

import * as service from "./concept.service";
import {
  conceptIdParamSchema,
  createConceptSchema,
  updateConceptSchema,
} from "./concept.schema";

export async function createConcept(
  req: Request,
  res: Response,
) {
  const body = createConceptSchema.parse(req.body);

  const concept = await service.createConcept(
    body.name,
    body.category ?? null,
  );

  res.status(201).json({
    data: concept,
  });
}

export async function getConcept(
  req: Request,
  res: Response,
) {
  const { conceptId } =
    conceptIdParamSchema.parse(req.params);

  const concept =
    await service.getConcept(conceptId);

  res.status(200).json({
    data: concept,
  });
}

export async function listConcepts(
  req: Request,
  res: Response,
) {
  const rawLimit = Number(req.query.limit ?? 50);
  const rawOffset = Number(req.query.offset ?? 0);

  const limit = Number.isFinite(rawLimit)
    ? Math.min(
        Math.max(Math.trunc(rawLimit), 1),
        100,
      )
    : 50;

  const offset = Number.isFinite(rawOffset)
    ? Math.max(Math.trunc(rawOffset), 0)
    : 0;

  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
      : undefined;

  const category =
    typeof req.query.category === "string"
      ? req.query.category.trim()
      : undefined;

  const concepts =
    await service.listConcepts(
      limit,
      offset,
      search,
      category,
    );

  res.status(200).json({
    data: concepts,
  });
}

export async function updateConcept(
  req: Request,
  res: Response,
) {
  const { conceptId } =
    conceptIdParamSchema.parse(req.params);

  const body = updateConceptSchema.parse(req.body);

  const concept =
    await service.updateConcept(
      conceptId,
      {
        ...(body.name !== undefined && {
          name: body.name,
        }),
        ...(body.category !== undefined && {
          category: body.category,
        }),
      },
    );

  res.status(200).json({
    data: concept,
  });
}

export async function deleteConcept(
  req: Request,
  res: Response,
) {
  const { conceptId } =
    conceptIdParamSchema.parse(req.params);

  await service.deleteConcept(conceptId);

  res.status(204).send();
}