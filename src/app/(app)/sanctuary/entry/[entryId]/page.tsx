"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocalizedHref } from "@/hooks/use-localized-href";

export default function EntryRedirectPage() {
  const params = useParams<{ entryId: string }>();
  const router = useRouter();
  const to = useLocalizedHref();
  const entryId = params?.entryId || "";

  useEffect(() => {
    if (entryId) {
      // Redirect to the magazine entry page
      router.replace(to(`/sanctuary/magazine/${entryId}`));
    }
  }, [entryId, router, to]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059] mx-auto mb-4" />
        <p className="text-stone-600">Redirection...</p>
      </div>
    </div>
  );
}
