export function formatEventDate(
  value?: string | null,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) return "Não informado";

  const dateOnly = value.split("T")[0];
  const [year, month, day] = dateOnly.split("-");

  if (!year || !month || !day) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    ...options,
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
}
