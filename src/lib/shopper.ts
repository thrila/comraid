"use client";
import { useCallback, useEffect, useState } from "react";
import { useTrackEventMutation } from "./api/catalog";
import type { InteractionType } from "@/types";

const SHOPPER_KEY = "shop_shopper_id";

// Timezones are a better country signal than browser language (lots of browsers say en-US).
const TIMEZONE_REGIONS: Record<string, string> = {
  "Africa/Lagos": "NG",
  "Africa/Accra": "GH",
  "Africa/Nairobi": "KE",
  "Africa/Johannesburg": "ZA",
  "Africa/Cairo": "EG",
  "Africa/Abidjan": "CI",
  "Africa/Kampala": "UG",
  "Africa/Dar_es_Salaam": "TZ",
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Phoenix": "US",
  "America/Los_Angeles": "US",
  "America/Anchorage": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX",
  "Asia/Dubai": "AE",
  "Asia/Kolkata": "IN",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Australia/Sydney": "AU",
};

/**
 * Best-effort country hint from the browser. In production the API prefers the CDN's
 * geo-IP header (Cloudflare / Vercel / CloudFront), so this is only a fallback.
 */
function detectRegion(): string | undefined {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONE_REGIONS[zone]) return TIMEZONE_REGIONS[zone];
    const fromLocale = new Intl.Locale(navigator.language).maximize().region;
    return fromLocale && /^[A-Z]{2}$/.test(fromLocale) ? fromLocale : undefined;
  } catch {
    return undefined;
  }
}

export interface Shopper {
  /** Anonymous, per-browser id used to personalise recommendations before (or without) login */
  id: string;
  region?: string;
}

/** Returns null during SSR and the first client render. */
export function useShopper(): Shopper | null {
  const [shopper, setShopper] = useState<Shopper | null>(null);

  useEffect(() => {
    let id: string;
    try {
      id = localStorage.getItem(SHOPPER_KEY) ?? crypto.randomUUID();
      localStorage.setItem(SHOPPER_KEY, id);
    } catch {
      // Storage blocked (private mode etc.) - fall back to a per-tab id.
      id = crypto.randomUUID();
    }
    setShopper({ id, region: detectRegion() });
  }, []);

  return shopper;
}

/** Fire-and-forget interaction tracking; failures never block the shopper. */
export function useTrackInteraction() {
  const shopper = useShopper();
  const [trackEvent] = useTrackEventMutation();

  return useCallback(
    (type: InteractionType, productIds: string[]) => {
      if (!shopper || productIds.length === 0) return;
      trackEvent({ userId: shopper.id, region: shopper.region, type, productIds }).catch(() => {});
    },
    [shopper, trackEvent],
  );
}
