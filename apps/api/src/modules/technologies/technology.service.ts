import type { z } from "zod";

import * as repository from "./technology.repository";
import { updateTechnologySchema } from "./technology.schema";

type UpdateTechnologyInput = z.infer<
  typeof updateTechnologySchema
>;

type DatabaseError = {
  code?: string;
};

export async function createTechnology(
  name: string,
  category: string | null,
) {
  try {
    return await repository.createTechnology(
      name,
      category,
    );
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("TECHNOLOGY_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function getTechnology(id: string) {
  const technology =
    await repository.findTechnologyById(id);

  if (!technology) {
    throw new Error("TECHNOLOGY_NOT_FOUND");
  }

  return technology;
}

export async function listTechnologies(
  limit: number,
  offset: number,
  search?: string,
  category?: string,
) {
  return repository.listTechnologies(
    limit,
    offset,
    search,
    category,
  );
}

export async function updateTechnology(
  id: string,
  fields: UpdateTechnologyInput,
) {
  const existing =
    await repository.findTechnologyById(id);

  if (!existing) {
    throw new Error("TECHNOLOGY_NOT_FOUND");
  }

  if (Object.keys(fields).length === 0) {
    return existing;
  }

  // Normalize the Zod output before passing it
  // to a repository that uses exactOptionalPropertyTypes.
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
    return await repository.updateTechnology(
      id,
      repositoryFields,
    );
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new Error("TECHNOLOGY_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function deleteTechnology(id: string) {
  const technology =
    await repository.deleteTechnology(id);

  if (!technology) {
    throw new Error("TECHNOLOGY_NOT_FOUND");
  }

  return technology;
}