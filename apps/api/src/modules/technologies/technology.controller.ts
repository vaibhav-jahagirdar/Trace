import { Request, Response } from "express";

import * as service from "./technology.service";
import {
  createTechnologySchema,
  technologyIdParamSchema,
  updateTechnologySchema,
} from "./technology.schema";

export async function createTechnology(
  req: Request,
  res: Response,
) {
  const body = createTechnologySchema.parse(req.body);

  const technology = await service.createTechnology(
    body.name,
    body.category ?? null,
  );

  res.status(201).json({
    data: technology,
  });
}

export async function getTechnology(
  req: Request,
  res: Response,
) {
  const { technologyId } =
    technologyIdParamSchema.parse(req.params);

  const technology =
    await service.getTechnology(technologyId);

  res.status(200).json({
    data: technology,
  });
}

export async function listTechnologies(
  req: Request,
  res: Response,
) {
  const rawLimit = Number(req.query.limit ?? 50);
  const rawOffset = Number(req.query.offset ?? 0);

  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100)
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

  const technologies =
    await service.listTechnologies(
      limit,
      offset,
      search,
      category,
    );

  res.status(200).json({
    data: technologies,
  });
}

export async function updateTechnology(
  req: Request,
  res: Response,
) {
  const { technologyId } =
    technologyIdParamSchema.parse(req.params);

  const body = updateTechnologySchema.parse(req.body);

  const technology =
    await service.updateTechnology(
      technologyId,
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
    data: technology,
  });
}

export async function deleteTechnology(
  req: Request,
  res: Response,
) {
  const { technologyId } =
    technologyIdParamSchema.parse(req.params);

  await service.deleteTechnology(technologyId);

  res.status(204).send();
}