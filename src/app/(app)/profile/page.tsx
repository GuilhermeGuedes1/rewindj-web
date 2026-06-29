"use client";

import {
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyArtistProfileService,
  updateMyArtistProfileService,
} from "@/services/artists.service";
import { updateMeService } from "@/services/auth.service";
import type { Artist, UpdateMyArtistPayload } from "@/types/artist";

type AccountFormState = {
  name: string;
  phone: string;
};

type ArtistFormState = {
  stageName: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  pixKey: string;
};

type ProfileItemProps = {
  label: string;
  value?: string | null;
};

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return value.split("T")[0];
}

function formatDate(value?: string | null) {
  if (!value) return null;

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getInitialArtistForm(profile: Artist): ArtistFormState {
  return {
    stageName: profile.stageName ?? "",
    birthDate: toDateInputValue(profile.birthDate),
    address: profile.address ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    pixKey: profile.pixKey ?? "",
  };
}

function ProfileItem({ label, value }: ProfileItemProps) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="break-words text-sm font-medium text-foreground">
        {value || "Não informado"}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [account, setAccount] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [accountForm, setAccountForm] = useState<AccountFormState>({
    name: "",
    phone: "",
  });
  const [artistProfile, setArtistProfile] = useState<Artist | null>(null);
  const [artistForm, setArtistForm] = useState<ArtistFormState>({
    stageName: "",
    birthDate: "",
    address: "",
    city: "",
    state: "",
    pixKey: "",
  });
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingArtist, setIsEditingArtist] = useState(false);
  const [isLoadingArtist, setIsLoadingArtist] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingArtist, setIsSavingArtist] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [artistError, setArtistError] = useState<string | null>(null);
  const [artistSuccess, setArtistSuccess] = useState<string | null>(null);

  useEffect(() => {
    const nextAccount = {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    };

    setAccount(nextAccount);
    setAccountForm({
      name: nextAccount.name,
      phone: nextAccount.phone,
    });
  }, [user?.email, user?.name, user?.phone]);

  useEffect(() => {
    async function loadArtistProfile() {
      if (!user?.artistId) {
        setArtistProfile(null);
        setIsLoadingArtist(false);
        return;
      }

      try {
        setIsLoadingArtist(true);
        setArtistError(null);

        const data = await getMyArtistProfileService();

        setArtistProfile(data);
        setArtistForm(getInitialArtistForm(data));
      } catch (error: any) {
        console.log("Status:", error.response?.status);
        console.log("Data:", error.response?.data);
        console.error("Erro ao carregar perfil artístico:", error);
        setArtistProfile(null);
        setArtistError("Perfil artístico ainda não encontrado.");
      } finally {
        setIsLoadingArtist(false);
      }
    }

    loadArtistProfile();
  }, [user?.artistId]);

  function handleAccountChange(field: keyof AccountFormState, value: string) {
    setAccountForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleArtistChange(field: keyof ArtistFormState, value: string) {
    setArtistForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleStartAccountEditing() {
    setAccountForm({
      name: account.name,
      phone: account.phone,
    });
    setAccountError(null);
    setAccountSuccess(null);
    setIsEditingAccount(true);
  }

  function handleCancelAccountEditing() {
    setAccountForm({
      name: account.name,
      phone: account.phone,
    });
    setAccountError(null);
    setIsEditingAccount(false);
  }

  function handleStartArtistEditing() {
    if (artistProfile) {
      setArtistForm(getInitialArtistForm(artistProfile));
    }

    setArtistError(null);
    setArtistSuccess(null);
    setIsEditingArtist(true);
  }

  function handleCancelArtistEditing() {
    if (artistProfile) {
      setArtistForm(getInitialArtistForm(artistProfile));
    }

    setArtistError(null);
    setIsEditingArtist(false);
  }

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSavingAccount(true);
      setAccountError(null);
      setAccountSuccess(null);

      const updatedUser = await updateMeService({
        name: accountForm.name.trim(),
        phone: normalizeOptional(accountForm.phone),
      });

      const nextAccount = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
      };

      setAccount(nextAccount);
      setAccountForm({
        name: nextAccount.name,
        phone: nextAccount.phone,
      });
      setIsEditingAccount(false);
      setAccountSuccess("Conta atualizada com sucesso.");
    } catch (error: any) {
      setAccountError("Não foi possível salvar sua conta. Tente novamente.");
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function handleArtistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!artistProfile) return;

    const payload: UpdateMyArtistPayload = {
      stageName: artistForm.stageName.trim(),
      birthDate: normalizeOptional(artistForm.birthDate),
      address: normalizeOptional(artistForm.address),
      city: normalizeOptional(artistForm.city),
      state: normalizeOptional(artistForm.state),
      pixKey: normalizeOptional(artistForm.pixKey),
    };

    try {
      setIsSavingArtist(true);
      setArtistError(null);
      setArtistSuccess(null);

      const updatedArtist = await updateMyArtistProfileService(payload);

      setArtistProfile(updatedArtist);
      setArtistForm(getInitialArtistForm(updatedArtist));
      setIsEditingArtist(false);
      setArtistSuccess("Perfil artístico atualizado com sucesso.");
    } catch (error: any) {
      console.error(
        "Erro ao atualizar perfil artístico:",
        error.response?.data,
      );
      setArtistError("Não foi possível salvar seu perfil. Tente novamente.");
    } finally {
      setIsSavingArtist(false);
    }
  }

  const displayName = artistProfile?.stageName || account.name || "Meu Perfil";

  return (
    <div>
      <PageHeader
        eyebrow="Meu Perfil"
        title={displayName}
        description="Gerencie seus dados de conta e, quando disponível, seu perfil artístico."
      />

      <div className="space-y-4">
        <form onSubmit={handleAccountSubmit}>
          <Card className="orbit-shell overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
                    <UserCircle className="size-6 text-primary" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold tracking-normal">
                      Minha Conta
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Nome, email e telefone usados para acessar o RewindJ.
                    </p>
                  </div>
                </div>

                {!isEditingAccount ? (
                  <Button type="button" onClick={handleStartAccountEditing}>
                    <Pencil />
                    Editar
                  </Button>
                ) : null}
              </div>

              {accountError ? (
                <div className="mb-4 rounded-lg border border-destructive/40 bg-muted/40 p-4 text-sm text-destructive">
                  {accountError}
                </div>
              ) : null}

              {accountSuccess ? (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/40 bg-muted/40 p-4 text-sm text-primary">
                  <CheckCircle2 className="size-4" />
                  {accountSuccess}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                {isEditingAccount ? (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="name">
                      Nome
                    </label>
                    <Input
                      id="name"
                      value={accountForm.name}
                      onChange={(event) =>
                        handleAccountChange("name", event.target.value)
                      }
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                ) : (
                  <ProfileItem label="Nome" value={account.name} />
                )}

                <ProfileItem label="Email" value={account.email} />

                {isEditingAccount ? (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="phone">
                      Telefone
                    </label>
                    <Input
                      id="phone"
                      value={accountForm.phone}
                      onChange={(event) =>
                        handleAccountChange("phone", event.target.value)
                      }
                      placeholder="+55 21 99999-9999"
                    />
                  </div>
                ) : (
                  <ProfileItem label="Telefone" value={account.phone} />
                )}
              </div>

              {isEditingAccount ? (
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelAccountEditing}
                    disabled={isSavingAccount}>
                    <X />
                    Cancelar
                  </Button>

                  <Button type="submit" disabled={isSavingAccount}>
                    {isSavingAccount ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </form>

        {user?.artistId ? (
          <form onSubmit={handleArtistSubmit}>
            <Card className="orbit-shell overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
                      <Wallet className="size-6 text-primary" />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold tracking-normal">
                        Perfil Artístico
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Dados complementares usados na sua atuação artística.
                      </p>
                    </div>
                  </div>

                  {artistProfile && !isEditingArtist ? (
                    <Button type="button" onClick={handleStartArtistEditing}>
                      <Pencil />
                      Editar
                    </Button>
                  ) : null}
                </div>

                {isLoadingArtist ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Carregando perfil artístico...
                  </div>
                ) : !artistProfile ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    {artistError ?? "Perfil artístico ainda não encontrado."}
                  </div>
                ) : (
                  <>
                    {artistError ? (
                      <div className="mb-4 rounded-lg border border-destructive/40 bg-muted/40 p-4 text-sm text-destructive">
                        {artistError}
                      </div>
                    ) : null}

                    {artistSuccess ? (
                      <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/40 bg-muted/40 p-4 text-sm text-primary">
                        <CheckCircle2 className="size-4" />
                        {artistSuccess}
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      {isEditingArtist ? (
                        <>
                          <div className="grid gap-2">
                            <label
                              className="text-sm font-medium"
                              htmlFor="stageName">
                              Nome artístico
                            </label>
                            <Input
                              id="stageName"
                              value={artistForm.stageName}
                              onChange={(event) =>
                                handleArtistChange(
                                  "stageName",
                                  event.target.value,
                                )
                              }
                              placeholder="Nome artístico"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <label
                              className="text-sm font-medium"
                              htmlFor="birthDate">
                              Data de nascimento
                            </label>
                            <Input
                              id="birthDate"
                              type="date"
                              value={artistForm.birthDate}
                              onChange={(event) =>
                                handleArtistChange(
                                  "birthDate",
                                  event.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="grid gap-2 sm:col-span-2">
                            <label
                              className="text-sm font-medium"
                              htmlFor="address">
                              Endereço
                            </label>
                            <Input
                              id="address"
                              value={artistForm.address}
                              onChange={(event) =>
                                handleArtistChange(
                                  "address",
                                  event.target.value,
                                )
                              }
                              placeholder="Rua, número, complemento"
                            />
                          </div>

                          <div className="grid gap-2">
                            <label
                              className="text-sm font-medium"
                              htmlFor="city">
                              Cidade
                            </label>
                            <Input
                              id="city"
                              value={artistForm.city}
                              onChange={(event) =>
                                handleArtistChange("city", event.target.value)
                              }
                              placeholder="Rio de Janeiro"
                            />
                          </div>

                          <div className="grid gap-2">
                            <label
                              className="text-sm font-medium"
                              htmlFor="state">
                              Estado
                            </label>
                            <Input
                              id="state"
                              value={artistForm.state}
                              onChange={(event) =>
                                handleArtistChange(
                                  "state",
                                  event.target.value.toUpperCase(),
                                )
                              }
                              placeholder="RJ"
                              maxLength={2}
                            />
                          </div>

                          <div className="grid gap-2 sm:col-span-2">
                            <label
                              className="text-sm font-medium"
                              htmlFor="pixKey">
                              Chave Pix
                            </label>
                            <Input
                              id="pixKey"
                              value={artistForm.pixKey}
                              onChange={(event) =>
                                handleArtistChange("pixKey", event.target.value)
                              }
                              placeholder="email@pix.com"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <ProfileItem
                            label="Nome artístico"
                            value={artistProfile.stageName}
                          />
                          <ProfileItem
                            label="Data de nascimento"
                            value={formatDate(artistProfile.birthDate)}
                          />
                          <ProfileItem
                            label="Endereço"
                            value={artistProfile.address}
                          />
                          <ProfileItem
                            label="Cidade"
                            value={artistProfile.city}
                          />
                          <ProfileItem
                            label="Estado"
                            value={artistProfile.state}
                          />
                          <ProfileItem
                            label="Chave Pix"
                            value={artistProfile.pixKey}
                          />
                        </>
                      )}
                    </div>

                    {isEditingArtist ? (
                      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelArtistEditing}
                          disabled={isSavingArtist}>
                          <X />
                          Cancelar
                        </Button>

                        <Button type="submit" disabled={isSavingArtist}>
                          {isSavingArtist ? (
                            <>
                              <Loader2 className="animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save />
                              Salvar
                            </>
                          )}
                        </Button>
                      </div>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          </form>
        ) : null}
      </div>
    </div>
  );
}
