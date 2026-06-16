import { z } from "zod";

export const artistSchema = z.object({
  name: z.string().min(2, "Informe o nome do artista."),
  lastName: z.string().min(2, "Informe o sobrenome."),
  email: z.string().email("Informe um email valido."),
  phone: z.string().optional(),
  temporaryPassword: z
    .string()
    .min(6, "Use ao menos 6 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type ArtistFormValues = z.infer<typeof artistSchema>;
