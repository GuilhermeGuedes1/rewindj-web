"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

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

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setError(null);

    if (values.password !== values.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      const { confirmPassword, ...payload } = values;
      await registerUser(payload);
    } catch {
      setError("Nao foi possivel criar sua conta agora.");
    }
  }

  return (
    <Card className="orbit-shell mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Comece com uma organizacao pronta para artistas, clientes e eventos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                autoComplete="given-name"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                {...register("lastName")}
              />
              {errors.lastName ? (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repita sua senha"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            className="w-full"
            size="lg"
            type="submit"
            disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Criar conta
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Ja tem acesso?{" "}
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
