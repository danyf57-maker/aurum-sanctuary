"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EntryRedirectPage() {
  const params = useParams<{ entryId: string }>();
  const router = useRouter();
  const entryId = params?.entryId || "";

  useEffect(() => {
    if (entryId) {
      // Redirect to the magazine entry page
      router.replace(`/sanctuary/magazine/${entryId}`);
    }
  }, [entryId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059] mx-auto mb-4" />
        <p className="text-stone-600">Redirection...</p>
      </div>
    </div>
  );
}
