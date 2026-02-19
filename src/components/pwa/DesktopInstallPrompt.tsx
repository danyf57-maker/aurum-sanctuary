"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Analytics stub - module not yet implemented
type TrackEventParams = { name: string; params: Record<string, unknown> };
const trackEvent = (event: TrackEventParams) => {
  console.log("[Analytics]", event.name, event.params);
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "aurum_install_prompt_dismissed_at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const iOSStandalone =
    typeof (window.navigator as Navigator & { standalone?: boolean })
      .standalone === "boolean"
      ? Boolean(
          (window.navigator as Navigator & { standalone?: boolean }).standalone
        )
      : false;

  return (
    window.matchMedia("(display-mode: standalone)").matches || iOSStandalone
  );
}

export function DesktopInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDesktop = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 1024;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsInstalled(isStandaloneMode());

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || "0");
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) {
      setIsDismissed(true);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      void trackEvent({
        name: "cta_click",
        params: { location: "desktop_install_prompt", action: "shown" },
      });
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      void trackEvent({
        name: "cta_click",
        params: { location: "desktop_install_prompt", action: "installed" },
      });
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
    void trackEvent({
      name: "cta_click",
      params: { location: "desktop_install_prompt", action: "dismiss" },
    });
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setLoading(true);

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;

      void trackEvent({
        name: "cta_click",
        params: {
          location: "desktop_install_prompt",
          action:
            result.outcome === "accepted" ? "accept" : "dismiss_by_browser",
        },
      });

      if (result.outcome === "accepted") {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isDesktop || isInstalled || isDismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed left-6 bottom-6 z-[110] hidden lg:flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-xl backdrop-blur-md max-w-sm">
      <div className="rounded-xl bg-stone-100 p-2 text-stone-700">
        <Download className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-900">
          Installer Aurum sur ton bureau
        </p>
        <p className="text-xs text-stone-500">
          Accès rapide en un clic, comme une app native.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleInstall} disabled={loading}>
          {loading ? "..." : "Installer"}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </Button>
      </div>
    </div>
  );
}
