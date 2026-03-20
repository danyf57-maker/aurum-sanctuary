"use client";

import { useEffect } from "react";

export default function ServiceWorkerRefresh() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const hadController = Boolean(navigator.serviceWorker.controller);
    let didReload = false;

    const handleControllerChange = () => {
      if (!hadController || didReload) {
        return;
      }

      didReload = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    void navigator.serviceWorker.getRegistration().then((registration) => {
      registration?.update().catch(() => {
        // No-op: a failed update check should not interrupt the session.
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null;
}
