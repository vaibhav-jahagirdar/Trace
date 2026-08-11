import type { z } from "zod";

import * as repository from "./evaluation-config.repository";
import { updateEvaluationConfigSchema } from "./evaluation-config.schema";

type UpdateEvaluationConfigInput = z.infer<typeof updateEvaluationConfigSchema>;

type DatabaseError = {
  code?: string;
};

export async function createEvidenceCategory(
  code: string,
  name: string,
  description: string | null,
) {
  try {
    return await repository.createEvidenceCategory(code, name, description);
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("EVIDENCE_CATEGORY_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function getEvidenceCategory(id: string) {
  const category = await repository.findEvidenceCategoryById(id);

  if (!category) {
    throw new Error("EVIDENCE_CATEGORY_NOT_FOUND");
  }

  return category;
}

export async function listEvidenceCategories(
  limit: number,
  offset: number,
  search?: string,
) {
  return repository.listEvidenceCategories(limit, offset, search);
}

export async function updateEvidenceCategory(
  id: string,
  fields: UpdateEvaluationConfigInput,
) {
  const existing = await repository.findEvidenceCategoryById(id);

  if (!existing) {
    throw new Error("EVIDENCE_CATEGORY_NOT_FOUND");
  }

  if (Object.keys(fields).length === 0) {
    return existing;
  }

  const repositoryFields: {
    code?: string;
    name?: string;
    description?: string | null;
  } = {};

  if (fields.code !== undefined) {
    repositoryFields.code = fields.code;
  }

  if (fields.name !== undefined) {
    repositoryFields.name = fields.name;
  }

  if (fields.description !== undefined) {
    repositoryFields.description = fields.description;
  }

  try {
    return await repository.updateEvidenceCategory(id, repositoryFields);
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("EVIDENCE_CATEGORY_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function deleteEvidenceCategory(id: string) {
  try {
    const category = await repository.deleteEvidenceCategory(id);

    if (!category) {
      throw new Error("EVIDENCE_CATEGORY_NOT_FOUND");
    }

    return category;
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      throw new Error("EVIDENCE_CATEGORY_IN_USE");
    }

    throw error;
  }
}

export async function createEvaluationDimension(
  code: string,
  name: string,
  description: string | null,
) {
  try {
    return await repository.createEvaluationDimension(code, name, description);
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("EVALUATION_DIMENSION_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function getEvaluationDimension(id: string) {
  const dimension = await repository.findEvaluationDimensionById(id);

  if (!dimension) {
    throw new Error("EVALUATION_DIMENSION_NOT_FOUND");
  }

  return dimension;
}

export async function listEvaluationDimensions(
  limit: number,
  offset: number,
  search?: string,
) {
  return repository.listEvaluationDimensions(limit, offset, search);
}

export async function updateEvaluationDimension(
  id: string,
  fields: UpdateEvaluationConfigInput,
) {
  const existing = await repository.findEvaluationDimensionById(id);

  if (!existing) {
    throw new Error("EVALUATION_DIMENSION_NOT_FOUND");
  }

  if (Object.keys(fields).length === 0) {
    return existing;
  }

  const repositoryFields: {
    code?: string;
    name?: string;
    description?: string | null;
  } = {};

  if (fields.code !== undefined) {
    repositoryFields.code = fields.code;
  }

  if (fields.name !== undefined) {
    repositoryFields.name = fields.name;
  }

  if (fields.description !== undefined) {
    repositoryFields.description = fields.description;
  }

  try {
    return await repository.updateEvaluationDimension(id, repositoryFields);
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("EVALUATION_DIMENSION_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function deleteEvaluationDimension(id: string) {
  try {
    const dimension = await repository.deleteEvaluationDimension(id);

    if (!dimension) {
      throw new Error("EVALUATION_DIMENSION_NOT_FOUND");
    }

    return dimension;
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      throw new Error("EVALUATION_DIMENSION_IN_USE");
    }

    throw error;
  }
}

export async function createSuccessSignal(
  code: string,
  name: string,
  description: string | null,
) {
  try {
    return await repository.createSuccessSignal(code, name, description);
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("SUCCESS_SIGNAL_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function getSuccessSignal(id: string) {
  const signal = await repository.findSuccessSignalById(id);

  if (!signal) {
    throw new Error("SUCCESS_SIGNAL_NOT_FOUND");
  }

  return signal;
}

export async function listSuccessSignals(
  limit: number,
  offset: number,
  search?: string,
) {
  return repository.listSuccessSignals(limit, offset, search);
}

export async function updateSuccessSignal(
  id: string,
  fields: UpdateEvaluationConfigInput,
) {
  const existing = await repository.findSuccessSignalById(id);

  if (!existing) {
    throw new Error("SUCCESS_SIGNAL_NOT_FOUND");
  }

  if (Object.keys(fields).length === 0) {
    return existing;
  }

  const repositoryFields: {
    code?: string;
    name?: string;
    description?: string | null;
  } = {};

  if (fields.code !== undefined) {
    repositoryFields.code = fields.code;
  }

  if (fields.name !== undefined) {
    repositoryFields.name = fields.name;
  }

  if (fields.description !== undefined) {
    repositoryFields.description = fields.description;
  }

  try {
    return await repository.updateSuccessSignal(id, repositoryFields);
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("SUCCESS_SIGNAL_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function deleteSuccessSignal(id: string) {
  try {
    const signal = await repository.deleteSuccessSignal(id);

    if (!signal) {
      throw new Error("SUCCESS_SIGNAL_NOT_FOUND");
    }

    return signal;
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      throw new Error("SUCCESS_SIGNAL_IN_USE");
    }

    throw error;
  }
}
