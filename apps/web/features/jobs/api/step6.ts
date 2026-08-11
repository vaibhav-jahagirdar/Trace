import { api } from "@/lib/api/client";

export const SUCCESS_SIGNALS_ENDPOINT =
  "/v1/success-signals";

export type SuccessSignal = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type SuccessSignalsResponse = {
  data: SuccessSignal[];
};

export async function getSuccessSignals(): Promise<
  SuccessSignal[]
> {
  const response =
    await api.get<SuccessSignalsResponse>(
      SUCCESS_SIGNALS_ENDPOINT,
    );

  return response.data;
}