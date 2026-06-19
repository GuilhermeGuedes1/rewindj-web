import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(2, "Informe o nome do evento."),
  eventDate: z.string().min(1, "Informe a data do evento."),
  startTime: z.string().min(1, "Informe o horário de início."),
  endTime: z.string().min(1, "Informe o horário de término."),
  setDuration: z.string().optional(),
  venueName: z.string().min(2, "Informe o local."),
  address: z.string().min(2, "Informe o endereço."),
  city: z.string().min(2, "Informe a cidade."),
  state: z.string().min(2, "Informe o estado."),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.enum(["NEGOTIATING", "CONFIRMED", "LOST"]),
  hasContract: z.boolean(),
  artistId: z.string().min(1, "Selecione um artista."),
  clientName: z.string().min(2, "Informe o cliente."),
  clientPhone: z.string().optional(),
  clientEmail: z
    .string()
    .email("Informe um email válido.")
    .optional()
    .or(z.literal("")),
  clientCompanyName: z.string().optional(),
  notes: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
