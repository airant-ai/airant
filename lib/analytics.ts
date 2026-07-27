type EventProperties = Record<string, string | number | boolean>;

export function track(event: string, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("airant:analytics", { detail: { event, properties } }));
  if (process.env.NODE_ENV === "development") console.info("[AIRant event]", event, properties);
}
