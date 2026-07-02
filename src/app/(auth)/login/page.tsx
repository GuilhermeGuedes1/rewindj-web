"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { FaChrome } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
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
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { googleLoginService } from "@/services/auth.service";

const GOOGLE_ACCOUNT_NOT_FOUND_MESSAGE =
  "Conta não encontrada. Crie sua conta primeiro usando email e senha.";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("error") === "google_account_not_found") {
      setError(GOOGLE_ACCOUNT_NOT_FOUND_MESSAGE);
    }
  }, []);

  if (isLoading || isAuthenticated) {
    return null;
  }

  async function onSubmit(values: LoginFormValues) {
    setError(null);

    try {
      await login(values);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError("Email ou senha inválidos.");
        return;
      }

      setError("Não foi possível realizar o login. Tente novamente.");
    }
  }

  function handleGoogleLogin() {
    setError(null);

    try {
      googleLoginService();
    } catch {
      setError("Não foi possível iniciar o login com Google. Tente novamente.");
    }
  }

  return (
    <Card className=" mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar </CardTitle>
        <CardDescription>
          Acesse sua agenda, clientes, e operação de eventos.
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
                      placeholder="user@email.com"
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
                      autoComplete="current-password"
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
                <LogIn />
              )}
              Entrar
            </Button>
            <div className="mb-5 space-y-5">
              <Button
                className="w-full"
                size="lg"
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}>
                <FaChrome /> Entrar com google
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Ainda nao tem conta?{" "}
              <Link
                className="font-semibold text-primary hover:underline"
                href="/register">
                Criar acesso
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
