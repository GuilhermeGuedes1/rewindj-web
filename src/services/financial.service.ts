import { api } from "@/libs/axios";

export type FinancialSummaryParams = {
  month?: number;
  year?: number;
  artistId?: string;
};

export type FinancialSummary = {
  totalEvents: number;
  totalRevenue: number;
  averageFee: number;
};

type FinancialSummaryResponse = Partial<FinancialSummary> & {
  total_events?: number | string;
  total_revenue?: number | string;
  average_fee?: number | string;
  paidEvents?: number | string;
  paid_events?: number | string;
  revenue?: number | string;
  total?: number | string;
  totalFee?: number | string;
  total_fee?: number | string;
  avgFee?: number | string;
  avg_fee?: number | string;
};

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const normalizedValue = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const numberValue = Number(normalizedValue);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeFinancialSummary(
  data: FinancialSummaryResponse,
): FinancialSummary {
  return {
    totalEvents: toNumber(
      data.totalEvents ?? data.total_events ?? data.paidEvents ?? data.paid_events,
    ),
    totalRevenue: toNumber(
      data.totalRevenue ??
        data.total_revenue ??
        data.totalFee ??
        data.total_fee ??
        data.revenue ??
        data.total,
    ),
    averageFee: toNumber(
      data.averageFee ?? data.average_fee ?? data.avgFee ?? data.avg_fee,
    ),
  };
}

export async function getFinancialSummaryService(
  params?: FinancialSummaryParams,
) {
  const queryParams = {
    month: params?.month,
    year: params?.year,
    artistId: params?.artistId || undefined,
  };
  const hasParams = Object.values(queryParams).some(
    (value) => value !== undefined,
  );

  if (!hasParams) {
    const response =
      await api.get<FinancialSummaryResponse>("/financial/summary");

    return normalizeFinancialSummary(response.data);
  }

  const response = await api.get<FinancialSummaryResponse>("/financial/summary", {
    params: queryParams,
  });

  return normalizeFinancialSummary(response.data);
}
