"use client";

import { useEffect, useRef, useState } from "react";
import { Download, PlusSquare, Share2, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLocale } from "@/hooks/use-locale";
import { trackEvent } from "@/lib/analytics/client";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PromptSurface = "browser" | "ios";

const DISMISS_KEY = "aurum_install_prompt_dismissed_at";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const iOSStandalone =
    typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === "boolean"
      ? Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
      : false;

  return window.matchMedia("(display-mode: standalone)").matches || iOSStandalone;
}

function detectIOS() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

function detectSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /safari/i.test(ua) && !/crios|fxios|edgios|chrome|android/i.test(ua);
}

export function InstallPrompt() {
  const locale = useLocale();
  const isFr = locale === "fr";

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [surface, setSurface] = useState<PromptSurface | null>(null);
  const hasTrackedVisible = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    setIsStandalone(isStandaloneMode());
    syncViewport();

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || "0");
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) {
      setIsDismissed(true);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setSurface("browser");
    };

    const onAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setSurface(null);
      void trackEvent({
        name: "cta_click",
        params: {
          location: "install_prompt",
          action: "installed",
          platform: isDesktop ? "desktop" : "mobile",
        },
      });
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("resize", syncViewport);

    if (detectIOS() && detectSafari() && !isStandaloneMode()) {
      setSurface("ios");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("resize", syncViewport);
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!surface || isStandalone || isDismissed || hasTrackedVisible.current) {
      return;
    }

    hasTrackedVisible.current = true;
    void trackEvent({
      name: "cta_click",
      params: {
        location: "install_prompt",
        action: "shown",
        surface,
        platform: isDesktop ? "desktop" : "mobile",
      },
    });
  }, [surface, isStandalone, isDismissed, isDesktop]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
    setGuideOpen(false);
    void trackEvent({
      name: "cta_click",
      params: {
        location: "install_prompt",
        action: "dismiss",
        surface: surface ?? "unknown",
        platform: isDesktop ? "desktop" : "mobile",
      },
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
          location: "install_prompt",
          action: result.outcome === "accepted" ? "accept" : "dismiss_by_browser",
          surface: "browser",
          platform: isDesktop ? "desktop" : "mobile",
        },
      });

      if (result.outcome === "accepted") {
        setIsStandalone(true);
      }

      setDeferredPrompt(null);
      if (surface === "browser") {
        setSurface(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const openGuide = () => {
    setGuideOpen(true);
    void trackEvent({
      name: "cta_click",
      params: {
        location: "install_prompt",
        action: "open_ios_guide",
        surface: "ios",
        platform: "mobile",
      },
    });
  };

  if (!surface || isStandalone || isDismissed) {
    return null;
  }

  const isIOSGuide = surface === "ios";
  const title = isIOSGuide
    ? isFr
      ? "Ajouter Aurum sur ton iPhone"
      : "Add Aurum to your iPhone"
    : isDesktop
      ? isFr
        ? "Installer Aurum sur ton bureau"
        : "Install Aurum on your desktop"
      : isFr
        ? "Installer Aurum sur ton telephone"
        : "Install Aurum on your phone";

  const body = isIOSGuide
    ? isFr
      ? "Garde Aurum a un geste de toi depuis l'ecran d'accueil, avec une vraie sensation d'app."
      : "Keep Aurum one tap away from your home screen, with a real app-like feel."
    : isDesktop
      ? isFr
        ? "Ouvre Aurum en un clic, comme une app privee."
        : "Open Aurum in one click, like a private app."
      : isFr
        ? "Retrouve ton espace de reflection prive plus vite, avec rappels et acces direct."
        : "Reach your private reflection space faster, with reminders and direct access.";

  return (
    <>
      <div
        className={
          isDesktop
            ? "fixed bottom-6 left-6 z-[110] hidden max-w-sm items-center gap-3 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-xl backdrop-blur-md lg:flex"
            : "fixed inset-x-4 bottom-4 z-[110] rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl backdrop-blur-md lg:hidden"
        }
      >
        <div className={isDesktop ? "rounded-xl bg-stone-100 p-2 text-stone-700" : "mb-3 inline-flex rounded-xl bg-stone-100 p-2 text-stone-700"}>
          {isIOSGuide ? <Smartphone className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </div>

        <div className={isDesktop ? "min-w-0 flex-1" : "mb-4"}>
          <p className="text-sm font-medium text-stone-900">{title}</p>
          <p className="text-xs text-stone-500">{body}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={isIOSGuide ? openGuide : handleInstall} disabled={loading}>
            {loading ? "..." : isIOSGuide ? (isFr ? "Voir comment" : "How to install") : (isFr ? "Installer" : "Install")}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDismiss}>
            <X className="h-4 w-4" />
            <span className="sr-only">{isFr ? "Fermer" : "Close"}</span>
          </Button>
        </div>
      </div>

      <Sheet open={guideOpen} onOpenChange={setGuideOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-stone-200 px-5 pb-8 pt-6">
          <SheetHeader className="text-left">
            <SheetTitle>{isFr ? "Installer Aurum sur iPhone" : "Install Aurum on iPhone"}</SheetTitle>
            <SheetDescription>
              {isFr
                ? "Safari ne propose pas de bouton d'installation automatique. Fais-le en trois gestes."
                : "Safari does not show an automatic install button. Do it in three quick steps."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-900">
                <Share2 className="h-4 w-4 text-stone-700" />
                <span>{isFr ? "1. Ouvre le menu Partager" : "1. Open the Share menu"}</span>
              </div>
              <p className="text-sm text-stone-600">
                {isFr
                  ? "Dans Safari, touche l'icone Partager au centre ou en bas de l'ecran."
                  : "In Safari, tap the Share icon at the bottom or center of the screen."}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-900">
                <PlusSquare className="h-4 w-4 text-stone-700" />
                <span>{isFr ? "2. Choisis Sur l'ecran d'accueil" : "2. Choose Add to Home Screen"}</span>
              </div>
              <p className="text-sm text-stone-600">
                {isFr
                  ? "Fais defiler la feuille d'actions si besoin, puis touche Sur l'ecran d'accueil."
                  : "Scroll the action sheet if needed, then tap Add to Home Screen."}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-900">
                <Download className="h-4 w-4 text-stone-700" />
                <span>{isFr ? "3. Confirme Ajouter" : "3. Confirm Add"}</span>
              </div>
              <p className="text-sm text-stone-600">
                {isFr
                  ? "Aurum apparaitra ensuite comme une app depuis ton ecran d'accueil."
                  : "Aurum will then appear like an app on your home screen."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button className="flex-1" onClick={() => setGuideOpen(false)}>
              {isFr ? "C'est compris" : "Got it"}
            </Button>
            <Button variant="ghost" onClick={handleDismiss}>
              {isFr ? "Plus tard" : "Later"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
