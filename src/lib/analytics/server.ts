import "server-only";

import { db } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { TrackedEventName } from "@/lib/analytics/types";

type ServerTrackPayload = {
  userId?: string | null;
  userEmail?: string | null;
  clientId?: string | null;
  path?: string | null;
  params?: Record<string, unknown>;
};

export async function trackServerEvent(
  name: TrackedEventName,
  payload: ServerTrackPayload = {}
) {
  try {
    await db.collection("analyticsEvents").add({
      name,
      userId: payload.userId ?? null,
      userEmail: payload.userEmail ?? null,
      clientId: payload.clientId ?? null,
      path: payload.path ?? null,
      params: payload.params ?? {},
      occurredAt: Timestamp.now(),
      source: "server",
    });
  } catch (error) {
    console.error("trackServerEvent failed", error);
  }
}
