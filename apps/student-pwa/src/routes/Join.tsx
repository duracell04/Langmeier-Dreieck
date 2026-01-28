import React from "react";
import { Button, Card, Container, Footer, Navbar, Section, TextInput } from "@triangle/ui-kit";
import {
  clearStoredIdentity,
  joinClass,
  loadStoredIdentity,
  PRIMARY_DEMO_JOIN_CODE,
  type StoredIdentity,
} from "../services/joinUseCases";
import { useI18n } from "../i18n";
import { LanguageToggle } from "../ui/LanguageToggle";

const MARKERS = [
  { id: "primary", swatch: "bg-primary" },
  { id: "success", swatch: "bg-success" },
  { id: "warning", swatch: "bg-warning" },
  { id: "info", swatch: "bg-info" },
  { id: "ink", swatch: "bg-foreground" },
] as const;

function readJoinCodeFromUrl(): string | null {
  const url = new URL(window.location.href);
  const fromSearch = url.searchParams.get("code");
  if (fromSearch) return fromSearch;

  if (url.hash.includes("?")) {
    const [, query] = url.hash.split("?");
    const params = new URLSearchParams(query);
    return params.get("code");
  }
  if (url.hash.startsWith("#/demo")) {
    return PRIMARY_DEMO_JOIN_CODE;
  }
  return null;
}

export function Join() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const copyright = t("common.copyright", { year, brand: t("common.brand") });
  const [code, setCode] = React.useState("");
  const [identity, setIdentity] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "joining" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [stored, setStored] = React.useState<StoredIdentity | null>(null);
  const [autoJoin, setAutoJoin] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(() => navigator.onLine);

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
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  React.useEffect(() => {
    const urlCode = readJoinCodeFromUrl();
    if (!urlCode) return;
    setCode(urlCode.toUpperCase());
    setAutoJoin(true);
  }, []);

  const onJoin = React.useCallback(async (overrideCode?: string) => {
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
      await joinClass(normalized, identity);
      window.location.hash = "#/select";
    } catch {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setErrorMessage(offline ? t("join.errors.offline") : t("join.errors.joinFailed"));
      setStatus("error");
    }
  }, [code, identity, t]);

  const onJoinClick = React.useCallback(() => {
    onJoin();
  }, [onJoin]);

  React.useEffect(() => {
    if (!autoJoin) return;
    if (!code.trim()) return;
    if (status !== "idle") return;
    onJoin();
    setAutoJoin(false);
  }, [autoJoin, code, onJoin, status]);

  const onContinue = React.useCallback(async () => {
    if (!stored) return;
    if (!navigator.onLine) {
      window.location.hash = "#/select";
      return;
    }
    setStatus("joining");
    setErrorMessage(null);
    try {
      await joinClass(stored.joinCode, stored.identityMarker);
      window.location.hash = "#/select";
    } catch {
      await clearStoredIdentity();
      setStored(null);
      setErrorMessage(t("join.errors.missingClass"));
      setStatus("error");
    }
  }, [stored, t]);

  return (
    <div className="min-h-screen bg-bg text-foreground font-sans flex flex-col">
      <Navbar
        brand={t("common.brand")}
        ctaLabel={t("common.info")}
        onCtaClick={() => {
          window.location.hash = "#/landing";
        }}
        rightSlot={<LanguageToggle />}
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
                {stored ? (
                  <Card className="grid gap-2 bg-background p-4">
                    <div className="text-sm text-muted-foreground">{t("join.storedHint")}</div>
                    <Button onClick={onContinue} disabled={status === "joining"}>
                      {t("join.storedAction")}
                    </Button>
                  </Card>
                ) : null}

                <label className="grid gap-2 text-sm text-muted-foreground">
                  {t("join.codeLabel")}
                  <TextInput
                    value={code}
                    onChange={event => setCode(event.target.value.toUpperCase())}
                    placeholder={t("join.codePlaceholder")}
                    autoComplete="off"
                    inputMode="text"
                    maxLength={6}
                  />
                </label>

                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground">{t("join.colorLabel")}</div>
                  <div className="flex flex-wrap gap-2">
                    {MARKERS.map(marker => {
                      const selected = identity === marker.id;
                      const labelKey = `join.markers.${marker.id}`;
                      return (
                        <Button
                          key={marker.id}
                          type="button"
                          variant={selected ? "secondary" : "outline"}
                          size="sm"
                          className="gap-2"
                          aria-pressed={selected}
                          onClick={() => setIdentity(prev => (prev === marker.id ? null : marker.id))}
                        >
                          <span className={`h-3 w-3 rounded-full ${marker.swatch}`} aria-hidden="true" />
                          <span>{t(labelKey)}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

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
