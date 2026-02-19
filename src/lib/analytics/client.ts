"use client";

import type { TrackEventPayload } from "@/lib/analytics/types";

const CLIENT_ID_STORAGE_KEY = "aurum_ga_client_id";

function getOrSetClientId() {
  if (typeof window === "undefined") return null;
  let clientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (!clientId) {
    clientId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
      const rand = (Math.random() * 16) | 0;
      const value = char === "x" ? rand : (rand & 0x3) | 0x8;
      return value.toString(16);
    });
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
  }
  return clientId;
}

export async function trackEvent(payload: TrackEventPayload) {
  if (typeof window === "undefined") return;

  const clientId = getOrSetClientId();
  if (!clientId) return;

  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        name: payload.name,
        path: payload.path ?? window.location.pathname,
        params: payload.params ?? {},
      }),
      keepalive: true,
    });
  } catch (error) {
    console.error("trackEvent failed", error);
  }
}
