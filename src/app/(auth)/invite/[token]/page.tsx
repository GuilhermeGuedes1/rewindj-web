"use client";

import { useParams } from "next/navigation";

import { ArtistInviteAcceptForm } from "@/components/orbit/artist-invite-accept-form";

export default function InvitePage() {
  const params = useParams<{ token: string }>();

  return <ArtistInviteAcceptForm token={params.token} />;
}
