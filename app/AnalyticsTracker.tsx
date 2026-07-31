"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "../lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const value = pathname === "/result" ? "result" : pathname === "/" ? "home" : "other";
    track("page_view", { value });

    const params = new URLSearchParams(window.location.search);
    const campaignSource = params.get("utm_source");
    let source = campaignSource;
    if (!source && document.referrer) {
      try {
        const host = new URL(document.referrer).hostname.replace(/^www\./, "");
        if (host !== window.location.hostname) source = host;
      } catch { /* Ignore malformed referrers. */ }
    }
    if (source && !window.sessionStorage.getItem("airant_attribution_sent")) {
      window.sessionStorage.setItem("airant_attribution_sent", "1");
      track("campaign_visit", { value: source.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").slice(0, 32) });
    }
  }, [pathname]);

  return null;
}
