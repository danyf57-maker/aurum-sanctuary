"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";

function toAppPath(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export default function ProductEventTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams.toString();
    const fullPath = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedPathRef.current === fullPath) return;
    lastTrackedPathRef.current = fullPath;

    void trackEvent({
      name: "page_view",
      path: fullPath,
      params: {
        page_group: pathname.split("/")[1] || "root",
      },
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest<HTMLElement>(
        "[data-track],button,a,[role='button']"
      );
      if (!clickable) return;
      if (clickable.getAttribute("data-track-disabled") === "true") return;

      const dataTrack = clickable.getAttribute("data-track");
      const label =
        dataTrack ||
        clickable.getAttribute("aria-label") ||
        clickable.id ||
        clickable.tagName.toLowerCase();

      const href =
        clickable instanceof HTMLAnchorElement && clickable.href
          ? toAppPath(clickable.href)
          : null;

      void trackEvent({
        name: "ui_click",
        params: {
          track_id: label.slice(0, 80),
          tag: clickable.tagName.toLowerCase(),
          has_href: Boolean(href),
          href_path: href ?? undefined,
        },
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return null;
}

