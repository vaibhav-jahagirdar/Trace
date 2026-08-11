import type { z } from "zod";

import * as repository from "./concept.repository";
import { updateConceptSchema } from "./concept.schema";

type UpdateConceptInput = z.infer<
  typeof updateConceptSchema
>;

type DatabaseError = {
  code?: string;
};

export async function createConcept(
  name: string,
  category: string | null,
) {
  try {
    return await repository.createConcept(
      name,
      category,
    );
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("CONCEPT_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function getConcept(id: string) {
  const concept =
    await repository.findConceptById(id);

  if (!concept) {
    throw new Error("CONCEPT_NOT_FOUND");
  }

  return concept;
}

export async function listConcepts(
  limit: number,
  offset: number,
  search?: string,
  category?: string,
) {
  return repository.listConcepts(
    limit,
    offset,
    search,
    category,
  );
}

export async function updateConcept(
  id: string,
  fields: UpdateConceptInput,
) {
  const existing =
    await repository.findConceptById(id);

  if (!existing) {
    throw new Error("CONCEPT_NOT_FOUND");
  }

  if (Object.keys(fields).length === 0) {
    return existing;
  }

  const repositoryFields: {
    name?: string;
    category?: string | null;
  } = {};

  if (fields.name !== undefined) {
    repositoryFields.name = fields.name;
  }

  if (fields.category !== undefined) {
    repositoryFields.category = fields.category;
  }

  try {
    return await repository.updateConcept(
      id,
      repositoryFields,
    );
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("CONCEPT_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function deleteConcept(id: string) {
  const concept =
    await repository.deleteConcept(id);

  if (!concept) {
    throw new Error("CONCEPT_NOT_FOUND");
  }

  return concept;
}