"use client";

import {
  ArrowLeft,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { PageHeader } from "@/components/orbit/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getArtistByIdService,
  updateArtistService,
} from "@/services/artists.service";
import type { Artist, UpdateArtistPayload } from "@/types/artist";

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function ArtistEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [form, setForm] = useState({
    name: "",
    stageName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pixKey: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArtist() {
      if (!params.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await getArtistByIdService(params.id);

        setArtist(data);
        setForm({
          name: data.name ?? "",
          stageName: data.stageName ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          pixKey: data.pixKey ?? "",
        });
      } catch {
        setError("Não foi possível carregar os dados deste artista.");
      } finally {
        setIsLoading(false);
      }
    }

    loadArtist();
  }, [params.id]);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!params.id) return;

    const payload: UpdateArtistPayload = {
      name: form.name.trim(),
      stageName: form.stageName.trim(),
      phone: normalizeOptional(form.phone),
      address: normalizeOptional(form.address),
      city: normalizeOptional(form.city),
      state: normalizeOptional(form.state),
      pixKey: normalizeOptional(form.pixKey),
    };

    try {
      setIsSaving(true);
      setError(null);

      await updateArtistService(params.id, payload);

      router.push(`/artists/${params.id}`);
    } catch {
      setError("Não foi possível salvar as alterações do artista.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Editar artista"
        title={artist?.stageName || artist?.name || "Artista"}
        description="Atualize as informações do artista dentro da organização."
        action={
          <Button variant="outline" asChild>
            <Link href={params.id ? `/artists/${params.id}` : "/artists"}>
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Carregando artista...
        </div>
      ) : error && !artist ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          {error}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error ? (
            <div className="orbit-shell rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Card className="orbit-shell overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="size-5 text-primary" />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold tracking-normal">
                        Informações do artista
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Edite os dados principais do artista.
                      </p>
                    </div>
                  </div>
                </div>

                <Badge>ARTIST</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Nome <span className="text-primary">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Nome artístico <span className="text-primary">*</span>
                  </label>
                  <Input
                    value={form.stageName}
                    onChange={(event) =>
                      handleChange("stageName", event.target.value)
                    }
                    placeholder="Nome artístico"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={form.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    placeholder="+55 21 99999-9999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="orbit-shell overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="size-5 text-primary" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-normal">
                    Localização
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Endereço e cidade do artista.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Endereço</label>
                  <Input
                    value={form.address}
                    onChange={(event) =>
                      handleChange("address", event.target.value)
                    }
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Cidade</label>
                    <Input
                      value={form.city}
                      onChange={(event) =>
                        handleChange("city", event.target.value)
                      }
                      placeholder="Rio de Janeiro"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Input
                      value={form.state}
                      onChange={(event) =>
                        handleChange("state", event.target.value)
                      }
                      placeholder="RJ"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="orbit-shell overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="size-5 text-primary" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-normal">
                    Financeiro
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Informação usada para pagamentos.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:max-w-md">
                <label className="text-sm font-medium">Chave Pix</label>
                <Input
                  value={form.pixKey}
                  onChange={(event) =>
                    handleChange("pixKey", event.target.value)
                  }
                  placeholder="email@pix.com"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={params.id ? `/artists/${params.id}` : "/artists"}>
                Cancelar
              </Link>
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>

          <div className="orbit-shell rounded-lg p-4 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <Sparkles className="mt-0.5 size-4 text-primary" />
              Ao salvar, as informações do artista serão atualizadas em todo o
              sistema.
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
