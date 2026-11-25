"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ParticipantsDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/events/${id}/invitations#rsvps`);
  }, [id, router]);

  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 text-[#8f6f33]">
      <div className="w-8 h-8 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500">Redirection vers l'espace unifié Invitation & Invités...</p>
    </div>
  );
}
