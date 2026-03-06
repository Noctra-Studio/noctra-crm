"use client";

/**
 * Cookie Consent Utils
 * Handles persistence, expiration, DNT signals, and script injection.
 */

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

export const CONSENT_KEY = 'noctra_cookie_consent';
export const CONSENT_VERSION = '1.0';
export const CONSENT_DURATION = 365 * 24 * 60 * 60 * 1000; // 365 days

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: string, ...args: unknown[]) => void;
    fbq: ((command: string, ...args: unknown[]) => void) & {
      push?: (...args: unknown[]) => void;
      loaded?: boolean;
      version?: string;
      queue?: unknown[];
      callMethod?: (command: string, ...args: unknown[]) => void;
    };
    _fbq: unknown;
    doNotTrack?: string;
  }
}

/**
 * Checks if the user has enabled "Do Not Track" in their browser.
 */
export function shouldRespectDNT(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Actually, navigator might have it but TS doesn't know. 
  // We'll cast to any for this specific low-level browser check to avoid complex type augmentation.
  const nav = navigator as any;
  const win = window as any;
  const dnt = nav.doNotTrack || win.doNotTrack || nav.msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

/**
 * Gets the stored consent from localStorage.
 */
export function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CookieConsent;
  } catch {
    return null;
  }
}

/**
 * Checks if the consent is expired or from an older version.
 */
export function isConsentExpired(consent: CookieConsent): boolean {
  const now = Date.now();
  const age = now - consent.timestamp;
  return age > CONSENT_DURATION || consent.version !== CONSENT_VERSION;
}

/**
 * Saves consent to localStorage and dispatches a global event.
 */
export function saveConsent(consent: Omit<CookieConsent, 'timestamp' | 'version'>) {
  const fullConsent: CookieConsent = {
    ...consent,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  
  localStorage.setItem(CONSENT_KEY, JSON.stringify(fullConsent));
  
  // Dispatch custom event for real-time reactivity in the app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
      detail: fullConsent 
    }));
    
    // Trigger script loading/blocking
    manageScripts(fullConsent);
  }
}

/**
 * Manages the loading or blocking of scripts based on consent.
 */
export function manageScripts(consent: CookieConsent) {
  if (typeof window === 'undefined') return;

  // Respect DNT - if on, don't load tracking scripts regardless of consent
  if (shouldRespectDNT()) {
    console.log('Noctra: Respecting Do Not Track signal.');
    return;
  }

  // Analytics
  if (consent.analytics) {
    loadGoogleAnalytics();
    loadPlausible();
  }

  // Marketing
  if (consent.marketing) {
    loadFacebookPixel();
  }
}

// --- Script Loaders ---

function loadGoogleAnalytics() {
  const GA_ID = 'G-PY2G1X6V9D'; // Example ID, replace with real one
  if (document.querySelector('[data-ga-loaded]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.setAttribute('data-ga-loaded', 'true');
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: unknown[]) {
    // We use a type cast here because dataLayer.push is internal to gtag.js logic
    (window.dataLayer as any[]).push(args);
  };
  window.gtag('js', String(new Date()));
  window.gtag('config', GA_ID, { anonymize_ip: true });
}

function loadPlausible() {
  if (document.querySelector('[data-plausible-loaded]')) return;

  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', 'noctra.studio');
  script.src = 'https://plausible.io/js/script.js';
  script.setAttribute('data-plausible-loaded', 'true');
  document.head.appendChild(script);
}

function loadFacebookPixel() {
  const FB_PIXEL_ID = 'XXXXXXXXXX'; // Replace with real one
  if (document.querySelector('[data-fb-loaded]')) return;

  // Initialize FB Pixel without using arguments or apply() to satisfy linter
  if (!window.fbq) {
    const n = function(command: string, ...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod(command, ...args);
      } else {
        n.queue?.push([command, ...args]);
      }
    } as any;
    
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.setAttribute('data-fb-loaded', 'true');
  
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');
}
