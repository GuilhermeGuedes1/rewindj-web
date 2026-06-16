import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Dê um nome para o evento."),
  eventDate: z.string().min(1, "Escolha a data."),
  startTime: z.string().min(1, "Informe o início."),
  endTime: z.string().min(1, "Informe o término."),
  venueName: z.string().min(2, "Informe o local."),
  address: z.string().min(3, "Informe o endereço."),
  city: z.string().min(2, "Informe a cidade."),
  state: z.string().min(2, "Informe o estado."),
  artistId: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z
    .string()
    .email("Informe um email valido.")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
