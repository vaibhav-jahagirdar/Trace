import { Request, Response } from "express";

import * as service from "./evaluation-config.service";
import {
  evidenceCategoryIdParamSchema,
  evaluationDimensionIdParamSchema,
  successSignalIdParamSchema,
  createEvaluationConfigSchema,
  updateEvaluationConfigSchema,
} from "./evaluation-config.schema";

function getPagination(req: Request) {
  const rawLimit = Number(req.query.limit ?? 50);
  const rawOffset = Number(req.query.offset ?? 0);

  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100)
    : 50;

  const offset = Number.isFinite(rawOffset)
    ? Math.max(Math.trunc(rawOffset), 0)
    : 0;

  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  return {
    limit,
    offset,
    search,
  };
}

export async function createEvidenceCategory(req: Request, res: Response) {
  const body = createEvaluationConfigSchema.parse(req.body);

  const category = await service.createEvidenceCategory(
    body.code,
    body.name,
    body.description ?? null,
  );

  res.status(201).json({
    data: category,
  });
}

export async function listEvidenceCategories(req: Request, res: Response) {
  const { limit, offset, search } = getPagination(req);

  const categories = await service.listEvidenceCategories(
    limit,
    offset,
    search,
  );

  res.status(200).json({
    data: categories,
  });
}

export async function getEvidenceCategory(req: Request, res: Response) {
  const { evidenceCategoryId } = evidenceCategoryIdParamSchema.parse(
    req.params,
  );

  const category = await service.getEvidenceCategory(evidenceCategoryId);

  res.status(200).json({
    data: category,
  });
}

export async function updateEvidenceCategory(req: Request, res: Response) {
  const { evidenceCategoryId } = evidenceCategoryIdParamSchema.parse(
    req.params,
  );

  const body = updateEvaluationConfigSchema.parse(req.body);

  const category = await service.updateEvidenceCategory(
    evidenceCategoryId,
    body,
  );

  res.status(200).json({
    data: category,
  });
}

export async function deleteEvidenceCategory(req: Request, res: Response) {
  const { evidenceCategoryId } = evidenceCategoryIdParamSchema.parse(
    req.params,
  );

  await service.deleteEvidenceCategory(evidenceCategoryId);

  res.status(204).send();
}

export async function createEvaluationDimension(req: Request, res: Response) {
  const body = createEvaluationConfigSchema.parse(req.body);

  const dimension = await service.createEvaluationDimension(
    body.code,
    body.name,
    body.description ?? null,
  );

  res.status(201).json({
    data: dimension,
  });
}

export async function listEvaluationDimensions(req: Request, res: Response) {
  const { limit, offset, search } = getPagination(req);

  const dimensions = await service.listEvaluationDimensions(
    limit,
    offset,
    search,
  );

  res.status(200).json({
    data: dimensions,
  });
}

export async function getEvaluationDimension(req: Request, res: Response) {
  const { evaluationDimensionId } = evaluationDimensionIdParamSchema.parse(
    req.params,
  );

  const dimension = await service.getEvaluationDimension(evaluationDimensionId);

  res.status(200).json({
    data: dimension,
  });
}

export async function updateEvaluationDimension(req: Request, res: Response) {
  const { evaluationDimensionId } = evaluationDimensionIdParamSchema.parse(
    req.params,
  );

  const body = updateEvaluationConfigSchema.parse(req.body);

  const dimension = await service.updateEvaluationDimension(
    evaluationDimensionId,
    body,
  );

  res.status(200).json({
    data: dimension,
  });
}

export async function deleteEvaluationDimension(req: Request, res: Response) {
  const { evaluationDimensionId } = evaluationDimensionIdParamSchema.parse(
    req.params,
  );

  await service.deleteEvaluationDimension(evaluationDimensionId);

  res.status(204).send();
}

export async function createSuccessSignal(req: Request, res: Response) {
  const body = createEvaluationConfigSchema.parse(req.body);

  const signal = await service.createSuccessSignal(
    body.code,
    body.name,
    body.description ?? null,
  );

  res.status(201).json({
    data: signal,
  });
}

export async function listSuccessSignals(req: Request, res: Response) {
  const { limit, offset, search } = getPagination(req);

  const signals = await service.listSuccessSignals(limit, offset, search);

  res.status(200).json({
    data: signals,
  });
}

export async function getSuccessSignal(req: Request, res: Response) {
  const { successSignalId } = successSignalIdParamSchema.parse(req.params);

  const signal = await service.getSuccessSignal(successSignalId);

  res.status(200).json({
    data: signal,
  });
}

export async function updateSuccessSignal(req: Request, res: Response) {
  const { successSignalId } = successSignalIdParamSchema.parse(req.params);

  const body = updateEvaluationConfigSchema.parse(req.body);

  const signal = await service.updateSuccessSignal(successSignalId, body);

  res.status(200).json({
    data: signal,
  });
}

export async function deleteSuccessSignal(req: Request, res: Response) {
  const { successSignalId } = successSignalIdParamSchema.parse(req.params);

  await service.deleteSuccessSignal(successSignalId);

  res.status(204).send();
}
