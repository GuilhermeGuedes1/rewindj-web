"use client";

import {
  Camera,
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  UserCircle,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/orbit/page-header";
import { ArtistAvatar } from "@/components/orbit/artist-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyArtistProfileService,
  uploadMyArtistProfileImageService,
  updateMyArtistProfileService,
} from "@/services/artists.service";
import type { Artist, UpdateMyArtistPayload } from "@/types/artist";
import { getArtistDisplayName } from "@/utils/artist";
import { Building2 } from "lucide-react";

type AccountFormState = {
  name: string;
  phone: string;
};

type ArtistFormState = {
  name: string;
  stageName: string;
  birthDate: string;
  phone: string;
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

function getOptionalArtistFields(form: ArtistFormState) {
  return {
    ...(form.stageName.trim() ? { stageName: form.stageName.trim() } : {}),
    ...(form.birthDate.trim() ? { birthDate: form.birthDate.trim() } : {}),
    ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
    ...(form.address.trim() ? { address: form.address.trim() } : {}),
    ...(form.city.trim() ? { city: form.city.trim() } : {}),
    ...(form.state.trim() ? { state: form.state.trim() } : {}),
    ...(form.pixKey.trim() ? { pixKey: form.pixKey.trim() } : {}),
  };
}

function getInitialArtistForm(profile: Artist): ArtistFormState {
  return {
    name: profile.name ?? "",
    stageName: profile.stageName ?? "",
    birthDate: toDateInputValue(profile.birthDate),
    phone: profile.phone ?? "",
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const isCompletingProfile = searchParams.get("complete") === "1";
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
    name: "",
    stageName: "",
    birthDate: "",
    phone: "",
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [artistError, setArtistError] = useState<string | null>(null);
  const [artistSuccess, setArtistSuccess] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = useState<string | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(
    null,
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  useEffect(() => {
    setAccount((current) => ({
      ...current,
      name: user?.name ?? "",
      email: user?.email ?? "",
    }));
    setAccountForm((current) => ({
      ...current,
      name: user?.name ?? "",
    }));
  }, [user?.email, user?.name]);

  useEffect(() => {
    if (isCompletingProfile) {
      setIsEditingArtist(true);
    }
  }, [isCompletingProfile]);

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
        setSelectedImagePreview(data.profileImageUrl ?? null);
        setSelectedImageName(null);
        setSelectedImageFile(null);
        setAccount((current) => ({
          ...current,
          name: data.name,
          phone: data.phone ?? "",
        }));
        setAccountForm({
          name: data.name,
          phone: data.phone ?? "",
        });
      } catch {
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

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setImageError(null);
    setImageSuccess(null);
    setSelectedImageName(file.name);
    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImagePreview() {
    setSelectedImageName(null);
    setSelectedImageFile(null);
    setSelectedImagePreview(artistProfile?.profileImageUrl ?? null);
  }

  async function handleImageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedImageFile || isUploadingImage) return;

    try {
      setIsUploadingImage(true);
      setImageError(null);
      setImageSuccess(null);

      const updatedArtist =
        await uploadMyArtistProfileImageService(selectedImageFile);

      setArtistProfile(updatedArtist);
      setSelectedImagePreview(updatedArtist.profileImageUrl ?? null);
      setSelectedImageName(null);
      setSelectedImageFile(null);
      queryClient.setQueryData(["artists", "me"], updatedArtist);
      queryClient.setQueryData<Artist[]>(["artists"], (currentArtists) =>
        currentArtists?.map((artist) =>
          artist.id === updatedArtist.id ? updatedArtist : artist,
        ),
      );
      setImageSuccess("Foto de perfil atualizada com sucesso.");
    } catch {
      setImageError("Não foi possível enviar sua foto. Tente novamente.");
    } finally {
      setIsUploadingImage(false);
    }
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
      setSelectedImagePreview(artistProfile.profileImageUrl ?? null);
      setSelectedImageName(null);
      setSelectedImageFile(null);
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

      if (!artistProfile) return;

      await updateMyArtistProfileService({
        name: accountForm.name.trim(),
        stageName: artistProfile.stageName,
        phone: normalizeOptional(accountForm.phone),
        birthDate: artistProfile.birthDate,
        address: artistProfile.address,
        city: artistProfile.city,
        state: artistProfile.state,
        pixKey: artistProfile.pixKey,
      });
      const updatedArtist = await getMyArtistProfileService();

      const nextAccount = {
        name: updatedArtist.name,
        email: account.email,
        phone: updatedArtist.phone ?? "",
      };

      setArtistProfile(updatedArtist);
      setArtistForm(getInitialArtistForm(updatedArtist));
      updateUser({ name: updatedArtist.name });
      setAccount(nextAccount);
      setAccountForm({
        name: nextAccount.name,
        phone: nextAccount.phone,
      });
      setIsEditingAccount(false);
      setAccountSuccess("Conta atualizada com sucesso.");
      queryClient.setQueryData(["artists", "me"], updatedArtist);
    } catch {
      setAccountError("Não foi possível salvar sua conta. Tente novamente.");
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function handleArtistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!artistProfile) return;

    if (!artistForm.name.trim()) {
      setArtistError("Informe seu nome para continuar.");
      return;
    }

    const payload: UpdateMyArtistPayload = {
      name: artistForm.name.trim(),
      ...getOptionalArtistFields(artistForm),
    };

    try {
      setIsSavingArtist(true);
      setArtistError(null);
      setArtistSuccess(null);

      await updateMyArtistProfileService(payload);
      const updatedArtist = await getMyArtistProfileService();

      setArtistProfile(updatedArtist);
      setArtistForm(getInitialArtistForm(updatedArtist));
      setSelectedImagePreview(updatedArtist.profileImageUrl ?? null);
      updateUser({ name: updatedArtist.name });
      queryClient.setQueryData(["artists", "me"], updatedArtist);
      setIsEditingArtist(false);
      setArtistSuccess("Perfil artístico atualizado com sucesso.");

      if (isCompletingProfile) {
        router.push("/dashboard");
      }
    } catch {
      setArtistError("Não foi possível salvar seu perfil. Tente novamente.");
    } finally {
      setIsSavingArtist(false);
    }
  }

  const displayName = getArtistDisplayName(
    artistProfile ?? { name: account.name },
    "Meu Perfil",
  );
  const canCreateOrganization =
    user?.role === "ARTIST" &&
    user.isIndependent === true &&
    !user.organizationId;

  return (
    <div>
      <PageHeader
        eyebrow="Meu Perfil"
        title={isCompletingProfile ? "Complete seu perfil" : displayName}
        description="Gerencie seus dados de conta e, quando disponível, seu perfil artístico."
        action={
          canCreateOrganization ? (
            <Button asChild>
              <Link href="/organization/create">
                <Building2 />
                Criar organização
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        {user?.artistId ? (
          <form onSubmit={handleImageSubmit}>
            <Card className="orbit-shell overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <ArtistAvatar
                      name={getArtistDisplayName(
                        artistProfile ?? { name: account.name },
                      )}
                      imageUrl={selectedImagePreview}
                      className="size-20"
                    />
                    <div>
                      <h2 className="text-xl font-semibold tracking-normal">
                        Foto de perfil
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Escolha a imagem que será exibida no seu perfil.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:justify-end">
                    <label
                      htmlFor="artist-profile-image"
                      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-accent">
                      <Camera className="size-4" />
                      Escolher foto
                    </label>
                    <input
                      id="artist-profile-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                    />
                    {selectedImageFile ? (
                      <Button type="submit" disabled={isUploadingImage}>
                        {isUploadingImage ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Save />
                        )}
                        {isUploadingImage ? "Enviando..." : "Salvar foto"}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {selectedImageName ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Foto selecionada: {selectedImageName}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImagePreview}
                      disabled={isUploadingImage}>
                      Remover seleção
                    </Button>
                  </div>
                ) : null}
                {imageError ? (
                  <div className="mt-4 rounded-lg border border-destructive/40 bg-muted/40 p-4 text-sm text-destructive">
                    {imageError}
                  </div>
                ) : null}
                {imageSuccess ? (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/40 bg-muted/40 p-4 text-sm text-primary">
                    <CheckCircle2 className="size-4" />
                    {imageSuccess}
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  JPG, PNG ou outro formato de imagem. Até 5 MB.
                </p>
              </CardContent>
            </Card>
          </form>
        ) : null}

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
                    <ArtistAvatar
                      name={artistProfile?.stageName || artistProfile?.name}
                      imageUrl={selectedImagePreview}
                      className="size-11"
                    />

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
                          {isCompletingProfile ? (
                            <div className="grid gap-2">
                              <label
                                className="text-sm font-medium"
                                htmlFor="artist-name">
                                Nome <span className="text-destructive">*</span>
                              </label>
                              <Input
                                id="artist-name"
                                value={artistForm.name}
                                onChange={(event) =>
                                  handleArtistChange("name", event.target.value)
                                }
                                placeholder="Seu nome completo"
                                required
                              />
                            </div>
                          ) : null}

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
                              {isCompletingProfile ? "Continuar" : "Salvar"}
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
