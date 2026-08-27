import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export const registerSchema = z
  .object({
    email: z.string().email("Informe um email válido."),
    password: z.string().min(6, "Use ao menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Use ao menos 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

export const organizationSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da organização."),
  document: z.string().trim().min(1, "Informe o CNPJ ou documento."),
  email: z.string().email("Informe um email válido."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type OrganizationFormValues = z.infer<typeof organizationSchema>;
