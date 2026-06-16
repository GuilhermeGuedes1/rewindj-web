import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  lastName: z.string().min(2, "Informe seu sobrenome."),
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "Use ao menos 6 caracteres."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
