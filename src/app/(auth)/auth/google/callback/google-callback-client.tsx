"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, loginWithToken } = useAuth();
  const hasHandledCallback = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || hasHandledCallback.current) return;

    hasHandledCallback.current = true;

    const token =
      searchParams.get("token") ?? searchParams.get("access_token");

    if (!token) {
      setError("Não foi possível concluir o login com Google. Tente novamente.");
      return;
    }

    loginWithToken(token).catch(() => {
      setError("Não foi possível concluir o login com Google. Tente novamente.");
    });
  }, [isLoading, loginWithToken, searchParams]);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
        {error ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <button
              className="text-sm font-semibold text-primary hover:underline"
              type="button"
              onClick={() => router.replace("/login")}>
              Voltar para o login
            </button>
          </>
        ) : (
          <>
            <Loader2 className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Concluindo login com Google...
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
