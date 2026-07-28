"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "../lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const value = pathname === "/result" ? "result" : pathname === "/" ? "home" : "other";
    track("page_view", { value });
  }, [pathname]);

  return null;
}
