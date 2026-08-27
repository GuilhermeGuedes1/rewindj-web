"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2, UserPlus } from "lucide-react";
import { FaChrome } from "react-icons/fa";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { googleLoginService } from "@/services/auth.service";

function getRegisterErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    const rawMessage = Array.isArray(message)
      ? message[0]
      : typeof message === "string"
        ? message
        : null;

    if (rawMessage) return rawMessage;
  }

  return "Não foi possível criar sua conta. Tente novamente.";
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) return null;

  async function onSubmit(values: RegisterFormValues) {
    setError(null);

    try {
      await register({
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    }
  }

  function handleGoogleRegister() {
    setError(null);

    try {
      googleLoginService();
    } catch {
      setError(
        "Não foi possível iniciar o cadastro com Google. Tente novamente.",
      );
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Cadastre-se para começar a usar o RewindJ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="voce@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="******"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="******"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <UserPlus />
              )}
              Criar conta
            </Button>

            <div className="relative py-1 text-center text-xs text-muted-foreground">
              <span className="relative z-10 bg-card px-3">ou</span>
              <span className="absolute inset-x-0 top-1/2 border-t border-border" />
            </div>

            <Button
              className="w-full"
              size="lg"
              type="button"
              variant="outline"
              onClick={handleGoogleRegister}>
              <FaChrome />
              Cadastrar com Google
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
        </Form>
      </CardContent>
    </Card>
  );
}
