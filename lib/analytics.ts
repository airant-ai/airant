type EventProperties = Record<string, string | number | boolean>;

function visitorId() {
  const key = "airant_visitor";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function track(event: string, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("airant:analytics", { detail: { event, properties } }));
  if (process.env.NODE_ENV === "development") console.info("[AIRant event]", event, properties);

  const allowed = {
    provider: typeof properties.provider === "string" ? properties.provider : "unknown",
    style: typeof properties.style === "string" ? properties.style : "unknown",
    value: typeof properties.value === "string" ? properties.value : "none",
  };

  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, visitorId: visitorId(), ...allowed }),
    keepalive: true,
  }).catch(() => undefined);
}
