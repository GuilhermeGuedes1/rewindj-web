"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ArtistInviteAcceptForm } from "@/components/orbit/artist-invite-accept-form";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <ArtistInviteAcceptForm token={token} />;
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteContent />
    </Suspense>
  );
}
