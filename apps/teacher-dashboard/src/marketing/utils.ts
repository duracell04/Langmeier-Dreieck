import { normalizeBaseUrl } from "../utils/url";

function resolveStudentBase(): string {
  const envUrl = (import.meta.env.VITE_STUDENT_APP_URL as string | undefined) ?? "";
  if (envUrl.trim()) return envUrl;
  if (typeof window === "undefined") return "/student";
  const { protocol, hostname, port } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const resolvedPort = port === "5174" ? "5173" : port;
    if (resolvedPort) {
      return `${protocol}//${hostname}:${resolvedPort}`;
    }
  }
  return "/student";
}

export function resolveStudentJoinUrl(): string {
  const base = normalizeBaseUrl(resolveStudentBase());
  if (!base) return "/student/#/join";
  return `${base}/#/join`;
}

export function resolveStudentDemoUrl(): string {
  const base = normalizeBaseUrl(resolveStudentBase());
  if (!base) return "/student/#/demo";
  return `${base}/#/demo`;
}

export function navigateToStudentJoin() {
  const url = resolveStudentJoinUrl();
  window.location.assign(url);
}

export function navigateToStudentDemo() {
  const url = resolveStudentDemoUrl();
  window.location.assign(url);
}

export function navigateToTeacherDashboard() {
  if (typeof window === "undefined") return;
  window.location.hash = "#/app";
}

export function navigateToLanding() {
  if (typeof window === "undefined") return;
  window.location.hash = "#/landing";
}

export function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
