"use client";

import { UserCircle } from "lucide-react";

import { cn } from "@/utils/utils";

type ArtistAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
  imageClassName?: string;
};

function getInitials(name?: string | null) {
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}

export function ArtistAvatar({
  name,
  imageUrl,
  className,
  imageClassName,
}: ArtistAvatarProps) {
  return (
    <div
      className={cn(
        "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
      aria-label={name ? `Foto de ${name}` : "Foto de perfil"}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name ? `Foto de ${name}` : "Foto de perfil"}
          className={cn("size-full object-cover", imageClassName)}
        />
      ) : name ? (
        getInitials(name)
      ) : (
        <UserCircle className="size-6" aria-hidden="true" />
      )}
    </div>
  );
}
