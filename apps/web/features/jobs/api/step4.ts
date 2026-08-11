import { api } from "@/lib/api/client";

export const EVALUATION_DIMENSIONS_ENDPOINT =
  "/v1/evaluation-dimensions";

export type EvaluationDimension = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type EvaluationDimensionsResponse = {
  data: EvaluationDimension[];
};

export async function getEvaluationDimensions(): Promise<
  EvaluationDimension[]
> {
  const response =
    await api.get<EvaluationDimensionsResponse>(
      EVALUATION_DIMENSIONS_ENDPOINT,
    );

  return response.data;
}