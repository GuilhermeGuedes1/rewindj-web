import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Dê um nome para o evento."),
  eventDate: z.string().min(1, "Escolha a data."),
  startTime: z.string().min(1, "Informe o início."),
  endTime: z.string().min(1, "Informe o término."),
  setDuration: z.string().optional(),
  venueName: z.string().min(2, "Informe o local."),
  address: z.string().min(3, "Informe o endereço."),
  city: z.string().min(2, "Informe a cidade."),
  state: z.string().min(2, "Informe o estado."),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  hasContract: z.boolean().default(false),
  artistId: z.string().min(1, "Selecione um artista."),
  clientName: z.string().min(2, "Informe o cliente."),
  clientPhone: z.string().optional(),
  clientEmail: z
    .string()
    .email("Informe um email valido.")
    .optional()
    .or(z.literal("")),
  clientCompanyName: z.string().optional(),
  notes: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
