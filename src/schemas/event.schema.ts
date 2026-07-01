import { z } from "zod";

export const paymentMethodValues = [
  "DEPOSIT",
  "FULL_ON_EVENT",
  "INVOICE",
  "INSTALLMENTS",
  "PIX",
  "CASH",
  "OTHER",
] as const;

export const paymentMethodLabels: Record<
  (typeof paymentMethodValues)[number],
  string
> = {
  DEPOSIT: "Depósito",
  FULL_ON_EVENT: "Integral no evento",
  INVOICE: "Nota fiscal",
  INSTALLMENTS: "Parcelado",
  PIX: "Pix",
  CASH: "Dinheiro",
  OTHER: "Outro",
};

export const eventSchema = z.object({
  title: z.string().min(2, "Informe o nome do evento."),
  eventDate: z.string().min(1, "Informe a data do evento."),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  setDuration: z.string().optional(),
  venueName: z.string().min(2, "Informe o local."),
  address: z.string().min(2, "Informe o endereço."),
  city: z.string().min(2, "Informe a cidade."),
  state: z.string().min(2, "Informe o estado."),
  fee: z.string().optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(paymentMethodValues).optional().or(z.literal("")),
  status: z.enum(["NEGOTIATING", "CONFIRMED", "LOST"]),
  hasContract: z.boolean(),
  artistId: z.string().min(1, "Selecione um artista."),
  clientMode: z.enum(["existing", "new"]),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z
    .string()
    .email("Informe um email válido.")
    .optional()
    .or(z.literal("")),
  clientCompanyName: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((values, context) => {
  if (values.clientMode === "existing") {
    if (!values.clientId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione um cliente.",
        path: ["clientId"],
      });
    }

    return;
  }

  if (!values.clientName || values.clientName.trim().length < 2) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe o cliente.",
      path: ["clientName"],
    });
  }

  if (!values.clientPhone || values.clientPhone.trim().length < 1) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe o telefone do cliente.",
      path: ["clientPhone"],
    });
  }
});

export type EventFormValues = z.infer<typeof eventSchema>;
