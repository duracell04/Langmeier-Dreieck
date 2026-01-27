export function resolveStudentJoinUrl(): string {
  const envUrl = (import.meta.env.VITE_STUDENT_APP_URL as string | undefined) ?? "";
  const trimmed = envUrl.trim();
  if (trimmed) {
    const cleaned = trimmed.replace(/\/$/, "");
    if (cleaned.includes("#")) {
      return cleaned;
    }
    if (cleaned.endsWith("/join")) {
      return cleaned;
    }
    return `${cleaned}/#/join`;
  }

  if (typeof window === "undefined") {
    return "/#/join";
  }

  const { protocol, hostname, port } = window.location;
  const resolvedPort = port === "5174" ? "5173" : port;
  const origin = `${protocol}//${hostname}${resolvedPort ? `:${resolvedPort}` : ""}`;
  return `${origin}/#/join`;
}

export function navigateToStudentJoin() {
  const url = resolveStudentJoinUrl();
  window.location.assign(url);
}

export function navigateToTeacherDashboard() {
  if (typeof window === "undefined") return;
  window.location.hash = "#/";
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
