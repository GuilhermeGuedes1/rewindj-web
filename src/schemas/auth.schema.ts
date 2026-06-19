import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome."),

    email: z.string().email("Informe um email válido."),
    phone: z
      .string()
      .refine(
        (value) => value.replace(/\D/g, "").length === 11,
        "Informe um telefone válido.",
      ),

    organizationName: z.string().min(2, "Informe o nome da organização."),

    organizationEmail: z
      .string()
      .email("Informe um email da organização válido."),

    organizationDocument: z.string().min(14, "Informe um CNPJ válido."),

    password: z.string().min(6, "Use ao menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Use ao menos 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
