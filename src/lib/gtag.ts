// src/lib/gtag.ts

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: URL) => {
  if (typeof window.gtag !== 'function') {
    return;
  }
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

const GA_CLIENT_ID_KEY = 'aurum_ga_client_id';

function getOrSetClientId() {
    if (typeof window === 'undefined') return null;
    let clientId = localStorage.getItem(GA_CLIENT_ID_KEY);
    if (!clientId) {
        // Generate a simple v4 UUID-like string
        clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem(GA_CLIENT_ID_KEY, clientId);
    }
    return clientId;
}


// https://developers.google.com/analytics/devguides/collection/gtagjs/events
// This function now sends events to our own backend, which then forwards them to GA.
export const event = ({ action, category, label, value }: GTagEvent) => {
   if (typeof window === 'undefined') return;

   const clientId = getOrSetClientId();
   if (!clientId) {
       console.error("Could not establish a client ID for analytics.");
       return;
   };

   // We don't use window.gtag('event') anymore for custom events.
   // We send the event to our own API endpoint for server-side tracking.
   fetch('/api/track', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json',
       },
       body: JSON.stringify({
           clientId,
           name: action,
           params: {
               event_category: category,
               event_label: label,
               value,
           }
       }),
   }).catch(err => console.error("Failed to track event:", err));
};


declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}
