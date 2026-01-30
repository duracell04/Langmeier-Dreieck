export function resolveAbsoluteUrl(base: string): string {
  const trimmed = base.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }
  const origin = typeof window !== "undefined" && window.location ? window.location.origin : "";
  if (!origin) return trimmed.replace(/\/$/, "");
  if (trimmed.startsWith("/")) {
    return `${origin}${trimmed}`.replace(/\/$/, "");
  }
  return `${origin}/${trimmed}`.replace(/\/$/, "");
}

export function normalizeBaseUrl(base: string): string {
  const absolute = resolveAbsoluteUrl(base);
  if (!absolute) return "";
  return absolute.split("#")[0].replace(/\/$/, "");
}
