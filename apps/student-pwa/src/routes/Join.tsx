import React from "react";
import { SessionManager, type PracticeSession } from "@triangle/core-engine";
import { Button, Card, Container, Footer, Navbar, Section, TextInput } from "@triangle/ui-kit";
import {
  clearStoredIdentity,
  joinClass,
  loadStoredIdentity,
  PRIMARY_DEMO_JOIN_CODE,
  type StoredIdentity,
} from "../services/joinUseCases";
import { IdbSessionStorage } from "@triangle/storage";
import { useI18n } from "../i18n";

const MARKERS = [
  { id: "primary", swatch: "bg-primary" },
  { id: "success", swatch: "bg-success" },
  { id: "warning", swatch: "bg-warning" },
  { id: "info", swatch: "bg-info" },
  { id: "ink", swatch: "bg-foreground" },
] as const;

function readJoinParams(): { code: string | null; autostart: boolean } {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  if (url.hash.includes("?")) {
    const [, query] = url.hash.split("?");
    const hashParams = new URLSearchParams(query);
    hashParams.forEach((value, key) => {
      params.set(key, value);
    });
  }
  let code = params.get("code");
  if (!code && url.hash.startsWith("#/demo")) {
    code = PRIMARY_DEMO_JOIN_CODE;
  }
  const autostart = params.get("autostart") === "1";
  return { code, autostart };
}

export function Join() {
  const { t } = useI18n();
  const sessionManager = React.useMemo(() => new SessionManager(new IdbSessionStorage()), []);
  const year = new Date().getFullYear();
  const copyright = t("common.copyright", { year, brand: t("common.brand") });
  const [code, setCode] = React.useState("");
  const [identity, setIdentity] = React.useState<string | null>(MARKERS[0].id);
  const [status, setStatus] = React.useState<"idle" | "joining" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [stored, setStored] = React.useState<StoredIdentity | null>(null);
  const [autoJoin, setAutoJoin] = React.useState(false);
  const [autoStart, setAutoStart] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(() => navigator.onLine);
  const [resumeSession, setResumeSession] = React.useState<PracticeSession | null>(null);
  const [resumeChecked, setResumeChecked] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    loadStoredIdentity().then(result => {
      if (!active) return;
      setStored(result);
      if (result?.identityMarker) {
        setIdentity(result.identityMarker);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  React.useEffect(() => {
    let active = true;
    sessionManager.recoverSession().then(session => {
      if (!active) return;
      setResumeSession(session);
      setResumeChecked(true);
    });
    return () => {
      active = false;
    };
  }, [sessionManager]);

  React.useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  React.useEffect(() => {
    const { code: urlCode, autostart } = readJoinParams();
    if (!urlCode) return;
    setCode(urlCode.toUpperCase());
    setAutoJoin(true);
    setAutoStart(autostart);
  }, []);

  const onJoin = React.useCallback(async (overrideCode?: string, options?: { autostart?: boolean }) => {
    const sourceCode = typeof overrideCode === "string" ? overrideCode : code;
    const normalized = sourceCode.trim().toUpperCase();
    if (!normalized) {
      setErrorMessage(t("join.errors.empty"));
      setStatus("error");
      return;
    }
    if (overrideCode) {
      setCode(normalized);
    }
    setStatus("joining");
    setErrorMessage(null);
    try {
      const result = await joinClass(normalized, identity);
      const allowOverride = result.classConfig.allowStudentOverride ?? false;
      const shouldAutostart = options?.autostart ?? autoStart;
      if (allowOverride) {
        window.location.hash = "#/select";
      } else {
        window.location.hash = shouldAutostart ? "#/practice" : "#/select";
      }
    } catch {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setErrorMessage(offline ? t("join.errors.offline") : t("join.errors.joinFailed"));
      setStatus("error");
    }
  }, [autoStart, code, identity, t]);

  const onJoinClick = React.useCallback(() => {
    onJoin();
  }, [onJoin]);

  React.useEffect(() => {
    if (!autoJoin) return;
    if (!code.trim()) return;
    if (status !== "idle") return;
    if (!resumeChecked) return;
    if (resumeSession) return;
    if (!navigator.onLine) return;
    const timer = window.setTimeout(() => {
      onJoin(undefined, { autostart: autoStart });
      setAutoJoin(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [autoJoin, autoStart, code, onJoin, resumeChecked, resumeSession, status]);

  const onContinue = React.useCallback(async () => {
    if (!stored) return;
    if (!navigator.onLine) {
      window.location.hash = "#/practice";
      return;
    }
    setStatus("joining");
    setErrorMessage(null);
    try {
      const result = await joinClass(stored.joinCode, stored.identityMarker);
      const allowOverride = result.classConfig.allowStudentOverride ?? false;
      if (allowOverride) {
        window.location.hash = "#/select";
      } else {
        window.location.hash = autoStart ? "#/practice" : "#/select";
      }
    } catch {
      await clearStoredIdentity();
      setStored(null);
      setErrorMessage(t("join.errors.missingClass"));
      setStatus("error");
    }
  }, [stored, t]);
  const onResume = React.useCallback(() => {
    window.location.hash = "#/practice";
  }, []);

  const onStartNew = React.useCallback(async () => {
    if (resumeSession) {
      await sessionManager.endSession(resumeSession.sessionId);
    }
    setResumeSession(null);
    if (code.trim()) {
      onJoin(code, { autostart: autoStart });
    }
  }, [autoStart, code, onJoin, resumeSession, sessionManager]);

  return (
    <div className="min-h-screen bg-bg text-foreground font-sans flex flex-col">
      <Navbar
        brand={t("common.brand")}
        onBrandClick={() => {
          window.location.hash = "#/landing";
        }}
        ctaLabel={t("common.info")}
        onCtaClick={() => {
          window.location.hash = "#/landing";
        }}
      />

      <main className="flex-1">
        <Section>
          <Container size="narrow">
            <div className="grid gap-8">
              <header className="grid gap-3 text-center">
                <p className="eyebrow">{t("landing.hero.eyebrow")}</p>
                <h1 className="text-3xl font-semibold text-foreground">{t("join.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("join.subtitle")}</p>
              </header>

              <Card raised className="grid gap-6 p-6 md:p-8">
                {resumeSession ? (
                  <Card className="grid gap-3 bg-background p-4">
                    <div className="text-sm text-muted-foreground">{t("join.resume.title")}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={onResume} size="sm">
                        {t("join.resume.continue")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={onStartNew}>
                        {t("join.resume.startNew")}
                      </Button>
                    </div>
                  </Card>
                ) : null}
                {stored ? (
                  <Card className="grid gap-2 bg-background p-4">
                    <div className="text-sm text-muted-foreground">{t("join.storedHint")}</div>
                    <Button variant="ghost" size="sm" onClick={onContinue} disabled={status === "joining"}>
                      {t("join.storedAction")}
                    </Button>
                  </Card>
                ) : null}

                <label className="grid gap-2 text-sm text-muted-foreground">
                  {t("join.codeLabel")}
                  <TextInput
                    value={code}
                    onChange={event => {
                      setCode(event.target.value.toUpperCase());
                      if (autoJoin) setAutoJoin(false);
                      if (autoStart) setAutoStart(false);
                    }}
                    placeholder={t("join.codePlaceholder")}
                    autoComplete="off"
                    inputMode="text"
                    maxLength={6}
                  />
                </label>

                {!isOnline ? <div className="text-sm text-warning">{t("join.offline")}</div> : null}
                {errorMessage ? <div className="text-sm text-warning">{errorMessage}</div> : null}

                <Button
                  onClick={onJoinClick}
                  disabled={!code.trim() || status === "joining"}
                  size="lg"
                  className="w-full"
                >
                  {status === "joining" ? t("join.action.joining") : t("join.action.join")}
                </Button>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer brand={t("common.brand")} copyrightText={copyright} />
    </div>
  );
}










