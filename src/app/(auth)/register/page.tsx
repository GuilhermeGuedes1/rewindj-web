"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, ArrowRight, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { phoneMask } from "@/utils/phoneMask";
import { cnpjMask } from "@/utils/cnpjMask";

type RegisterStep = 1 | 2;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<RegisterStep>(1);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      organizationName: "",
      organizationEmail: "",
      organizationDocument: "",
    },
  });
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  async function handleNextStep() {
    setError(null);

    const isValid = await trigger([
      "name",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ]);

    if (!isValid) return;

    setStep(2);
  }

  function handlePreviousStep() {
    setError(null);
    setStep(1);
  }

  async function onSubmit(values: RegisterFormValues) {
    setError(null);

    try {
      const { confirmPassword, ...payload } = values;

      await registerUser(payload);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;

        const rawMessage = Array.isArray(message)
          ? message[0]
          : typeof message === "string"
            ? message
            : null;

        if (rawMessage) {
          const lowerMessage = rawMessage.toLowerCase();

          if (lowerMessage.includes("email")) {
            setError("Informe um email válido ou use outro email.");
            return;
          }

          if (
            lowerMessage.includes("document") ||
            lowerMessage.includes("cnpj")
          ) {
            setError("Informe um CNPJ válido ou use outro CNPJ.");
            return;
          }

          if (lowerMessage.includes("phone")) {
            setError("Informe um telefone válido ou use outro telefone.");
            return;
          }

          setError(rawMessage);
          return;
        }
      }

      setError("Não foi possível criar sua conta. Tente novamente.");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Etapa {step} de 2
          </span>

          <div className="flex gap-1.5">
            <span
              className={`h-1.5 w-8 rounded-full ${
                step === 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <span
              className={`h-1.5 w-8 rounded-full ${
                step === 2 ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        </div>

        <div>
          <CardTitle>
            {step === 1 ? "Criar conta" : "Criar organização"}
          </CardTitle>

          <CardDescription>
            {step === 1
              ? "Informe seus dados para acessar o RewindJ."
              : "Agora cadastre os dados da sua agência ou operação."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Guilherme Guedes"
                  autoComplete="name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email pessoal</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  autoComplete="tel"
                  placeholder="(21) 99999-9999"
                  value={watch("phone")}
                  onChange={(e) =>
                    setValue("phone", phoneMask(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                type="button"
                onClick={handleNextStep}>
                Continuar
                <ArrowRight />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="organizationName">Nome da organização</Label>
                <Input
                  id="organizationName"
                  placeholder="RewindJ Agency"
                  {...register("organizationName")}
                />
                {errors.organizationName && (
                  <p className="text-sm text-destructive">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationEmail">Email da organização</Label>
                <Input
                  id="organizationEmail"
                  type="email"
                  placeholder="contato@rewindj.com"
                  {...register("organizationEmail")}
                />
                {errors.organizationEmail && (
                  <p className="text-sm text-destructive">
                    {errors.organizationEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationDocument">CNPJ</Label>
                <Input
                  id="organizationDocument"
                  placeholder="12.345.678/0001-90"
                  value={watch("organizationDocument")}
                  onChange={(e) =>
                    setValue("organizationDocument", cnpjMask(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                />
                {errors.organizationDocument && (
                  <p className="text-sm text-destructive">
                    {errors.organizationDocument.message}
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={isSubmitting}>
                  <ArrowLeft />
                  Voltar
                </Button>

                <Button size="lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <UserPlus />
                  )}
                  Criar
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              className="font-semibold text-primary hover:underline"
              href="/login">
              Entrar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
