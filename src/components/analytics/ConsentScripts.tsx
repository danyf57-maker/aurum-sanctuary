"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "aurum_cookie_consent";
const GTM_CONTAINER_ID = "GTM-WNDQPP94";

function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
}

export default function ConsentScripts() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => setEnabled(hasAnalyticsConsent());

    syncConsent();
    window.addEventListener("storage", syncConsent);
    window.addEventListener("aurum:cookie-consent-updated", syncConsent);

    return () => {
      window.removeEventListener("storage", syncConsent);
      window.removeEventListener("aurum:cookie-consent-updated", syncConsent);
    };
  }, []);

  if (!enabled) return null;

  return (
    <Script id="gtm-init" strategy="lazyOnload">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
      `}
    </Script>
  );
}
