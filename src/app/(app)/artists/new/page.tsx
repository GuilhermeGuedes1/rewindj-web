"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateArtist } from "@/hooks/use-artists";
import { artistSchema, type ArtistFormValues } from "@/schemas/artist.schema";

export default function NewArtistPage() {
  const router = useRouter();
  const createArtist = useCreateArtist();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      phone: "",
      temporaryPassword: "",
    },
  });

  async function onSubmit(values: ArtistFormValues) {
    setError(null);

    try {
      await createArtist.mutateAsync(values);
      router.push("/artists");
    } catch {
      setError("Nao foi possivel criar o artista agora.");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Novo artista"
        title="Adicione alguem ao roster"
        description="Crie um acesso inicial para o artista e mantenha os contatos prontos para convites e eventos."
        action={
          <Button variant="outline" asChild>
            <Link href="/artists">
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card className="orbit-shell">
        <CardContent className="p-5 sm:p-6">
          <Form {...form}>
            <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="DJ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Gabriel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="gabriel@orbit.local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="11999999999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="temporaryPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha temporaria</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Opcional neste fluxo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button
                className="w-full sm:w-fit"
                size="lg"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <UserPlus />
                )}
                Criar artista
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
