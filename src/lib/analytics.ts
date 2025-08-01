// src/lib/analytics.ts

export function logEventGA(
  action: string,
  category: string,
  label: string = ""
) {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }
}
