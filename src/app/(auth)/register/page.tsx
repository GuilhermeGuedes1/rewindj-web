"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Headphones,
  Loader2,
  UserPlus,
} from "lucide-react";
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
import {
  independentDjRegisterSchema,
  registerSchema,
  type IndependentDjRegisterFormValues,
  type RegisterFormValues,
} from "@/schemas/auth.schema";
import { registerArtistService } from "@/services/artists.service";
import { cnpjMask } from "@/utils/cnpjMask";
import { phoneMask } from "@/utils/phoneMask";
import { cn } from "@/utils/utils";

type RegisterStep = 1 | 2;
type AccountType = "artist" | "agency";

const accountTypeOptions: Array<{
  value: AccountType;
  title: string;
  description: string;
  icon: typeof Headphones;
}> = [
  {
    value: "artist",
    title: "DJ independente",
    description: "Cadastre seu acesso individual ao RewindJ.",
    icon: Headphones,
  },
  {
    value: "agency",
    title: "Agência / Time",
    description: "Crie sua conta com uma organização.",
    icon: Building2,
  },
];

function getRegisterErrorMessage(err: unknown) {
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
        return "Informe um email válido ou use outro email.";
      }

      if (lowerMessage.includes("document") || lowerMessage.includes("cnpj")) {
        return "Informe um CNPJ válido ou use outro CNPJ.";
      }

      if (lowerMessage.includes("phone")) {
        return "Informe um telefone válido ou use outro telefone.";
      }

      return rawMessage;
    }
  }

  return "Não foi possível criar sua conta. Tente novamente.";
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("agency");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<RegisterStep>(1);

  const agencyForm = useForm<RegisterFormValues>({
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

  const artistForm = useForm<IndependentDjRegisterFormValues>({
    resolver: zodResolver(independentDjRegisterSchema),
    defaultValues: {
      name: "",
      stageName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const agencyErrors = agencyForm.formState.errors;
  const artistErrors = artistForm.formState.errors;
  const isSubmitting =
    agencyForm.formState.isSubmitting || artistForm.formState.isSubmitting;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  function handleAccountTypeChange(type: AccountType) {
    setAccountType(type);
    setError(null);
    setStep(1);
  }

  async function handleNextStep() {
    setError(null);

    const isValid = await agencyForm.trigger([
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

  async function onAgencySubmit(values: RegisterFormValues) {
    setError(null);

    try {
      const { confirmPassword, ...payload } = values;
      void confirmPassword;

      await registerUser(payload);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    }
  }

  async function onArtistSubmit(values: IndependentDjRegisterFormValues) {
    setError(null);

    try {
      const { confirmPassword, ...payload } = values;
      await registerArtistService(payload);
      router.push("/login");
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-3">
        {accountType === "agency" ? (
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
        ) : (
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Cadastro de DJ
          </span>
        )}

        <div>
          <CardTitle>
            {accountType === "artist"
              ? "Criar conta"
              : step === 1
                ? "Criar conta"
                : "Criar organização"}
          </CardTitle>

          <CardDescription>
            {accountType === "artist"
              ? "Informe seus dados para acessar o RewindJ como DJ independente."
              : step === 1
                ? "Informe seus dados para acessar o RewindJ."
                : "Agora cadastre os dados da sua agência ou operação."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {accountTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = accountType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAccountTypeChange(option.value)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-glow"
                    : "border-border bg-transparent hover:bg-accent",
                )}>
                <span className="mb-3 flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="block text-sm font-semibold">
                  {option.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>

        {accountType === "artist" ? (
          <form
            className="space-y-5"
            onSubmit={artistForm.handleSubmit(onArtistSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="artist-name">Nome completo</Label>
              <Input
                id="artist-name"
                placeholder="Guilherme Guedes"
                autoComplete="name"
                {...artistForm.register("name")}
              />
              {artistErrors.name && (
                <p className="text-sm text-destructive">
                  {artistErrors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageName">Nome artístico</Label>
              <Input
                id="stageName"
                placeholder="DJ Gui"
                {...artistForm.register("stageName")}
              />
              {artistErrors.stageName && (
                <p className="text-sm text-destructive">
                  {artistErrors.stageName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist-email">Email</Label>
              <Input
                id="artist-email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                {...artistForm.register("email")}
              />
              {artistErrors.email && (
                <p className="text-sm text-destructive">
                  {artistErrors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist-phone">Telefone</Label>
              <Input
                id="artist-phone"
                autoComplete="tel"
                placeholder="(21) 99999-9999"
                value={artistForm.watch("phone")}
                onChange={(e) =>
                  artistForm.setValue("phone", phoneMask(e.target.value), {
                    shouldValidate: true,
                  })
                }
              />
              {artistErrors.phone && (
                <p className="text-sm text-destructive">
                  {artistErrors.phone.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="artist-password">Senha</Label>
                <Input
                  id="artist-password"
                  type="password"
                  autoComplete="new-password"
                  {...artistForm.register("password")}
                />
                {artistErrors.password && (
                  <p className="text-sm text-destructive">
                    {artistErrors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist-confirm-password">Confirmar senha</Label>
                <Input
                  id="artist-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  {...artistForm.register("confirmPassword")}
                />
                {artistErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {artistErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={artistForm.formState.isSubmitting}>
              {artistForm.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <UserPlus />
              )}
              Criar
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link
                className="font-semibold text-primary hover:underline"
                href="/login">
                Entrar
              </Link>
            </p>
          </form>
        ) : (
          <form
            className="space-y-5"
            onSubmit={agencyForm.handleSubmit(onAgencySubmit)}>
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Guilherme Guedes"
                    autoComplete="name"
                    {...agencyForm.register("name")}
                  />
                  {agencyErrors.name && (
                    <p className="text-sm text-destructive">
                      {agencyErrors.name.message}
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
                    {...agencyForm.register("email")}
                  />
                  {agencyErrors.email && (
                    <p className="text-sm text-destructive">
                      {agencyErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    autoComplete="tel"
                    placeholder="(21) 99999-9999"
                    value={agencyForm.watch("phone")}
                    onChange={(e) =>
                      agencyForm.setValue("phone", phoneMask(e.target.value), {
                        shouldValidate: true,
                      })
                    }
                  />
                  {agencyErrors.phone && (
                    <p className="text-sm text-destructive">
                      {agencyErrors.phone.message}
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
                      {...agencyForm.register("password")}
                    />
                    {agencyErrors.password && (
                      <p className="text-sm text-destructive">
                        {agencyErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      {...agencyForm.register("confirmPassword")}
                    />
                    {agencyErrors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {agencyErrors.confirmPassword.message}
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
                    {...agencyForm.register("organizationName")}
                  />
                  {agencyErrors.organizationName && (
                    <p className="text-sm text-destructive">
                      {agencyErrors.organizationName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationEmail">
                    Email da organização
                  </Label>
                  <Input
                    id="organizationEmail"
                    type="email"
                    placeholder="contato@rewindj.com"
                    {...agencyForm.register("organizationEmail")}
                  />
                  {agencyErrors.organizationEmail && (
                    <p className="text-sm text-destructive">
                      {agencyErrors.organizationEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationDocument">CNPJ</Label>
                  <Input
                    id="organizationDocument"
                    placeholder="12.345.678/0001-90"
                    value={agencyForm.watch("organizationDocument")}
                    onChange={(e) =>
                      agencyForm.setValue(
                        "organizationDocument",
                        cnpjMask(e.target.value),
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  />
                  {agencyErrors.organizationDocument && (
                    <p className="text-sm text-destructive">
                      {agencyErrors.organizationDocument.message}
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
                    disabled={agencyForm.formState.isSubmitting}>
                    <ArrowLeft />
                    Voltar
                  </Button>

                  <Button
                    size="lg"
                    type="submit"
                    disabled={agencyForm.formState.isSubmitting}>
                    {agencyForm.formState.isSubmitting ? (
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
        )}
      </CardContent>
    </Card>
  );
}
