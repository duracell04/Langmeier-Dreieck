import React from "react";
import { Button, Card, Container, Footer, Navbar, Section, TextInput } from "@triangle/ui-kit";
import {
  clearStoredIdentity,
  joinClass,
  loadStoredIdentity,
  PRIMARY_DEMO_JOIN_CODE,
  type StoredIdentity,
} from "../services/joinUseCases";

const MARKERS = [
  { id: "primary", label: "Blau", swatch: "bg-primary" },
  { id: "success", label: "Gruen", swatch: "bg-success" },
  { id: "warning", label: "Orange", swatch: "bg-warning" },
  { id: "info", label: "Violett", swatch: "bg-info" },
  { id: "ink", label: "Dunkel", swatch: "bg-foreground" },
];

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
      setErrorMessage("Bitte einen Code eingeben.");
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
      window.location.hash = "#/practice";
    } catch {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setErrorMessage(
        offline
          ? "Offline. Bitte spaeter erneut versuchen."
          : "Beitritt nicht moeglich. Code pruefen oder Demo nutzen."
      );
      setStatus("error");
    }
  }, [code, identity]);

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
      window.location.hash = "#/practice";
      return;
    }
    setStatus("joining");
    setErrorMessage(null);
    try {
      await joinClass(stored.joinCode, stored.identityMarker);
      window.location.hash = "#/practice";
    } catch {
      await clearStoredIdentity();
      setStored(null);
      setErrorMessage("Die Klasse existiert nicht mehr. Bitte neu beitreten.");
      setStatus("error");
    }
  }, [stored]);

  return (
    <div className="min-h-screen bg-bg text-foreground font-sans flex flex-col">
      <Navbar
        brand="Langmeier Dreieck-1x1"
        ctaLabel="Info"
        onCtaClick={() => {
          window.location.hash = "#/landing";
        }}
      />

      <main className="flex-1">
        <Section>
          <Container size="narrow">
            <div className="grid gap-8">
              <header className="grid gap-3 text-center">
                <p className="eyebrow">Dreieck-1x1</p>
                <h1 className="text-3xl font-semibold text-foreground">Beitreten</h1>
                <p className="text-sm text-muted-foreground">Kein Login noetig.</p>
              </header>

              <Card raised className="grid gap-6 p-6 md:p-8">
                {stored ? (
                  <Card className="grid gap-2 bg-background p-4">
                    <div className="text-sm text-muted-foreground">Letzte Klasse ist gespeichert.</div>
                    <Button onClick={onContinue} disabled={status === "joining"}>
                      Letzte Klasse wieder beitreten
                    </Button>
                  </Card>
                ) : null}

                <label className="grid gap-2 text-sm text-muted-foreground">
                  Code
                  <TextInput
                    value={code}
                    onChange={event => setCode(event.target.value.toUpperCase())}
                    placeholder="Code eingeben"
                    autoComplete="off"
                    inputMode="text"
                    maxLength={6}
                  />
                </label>

                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground">Farbe waehlen (optional)</div>
                  <div className="flex flex-wrap gap-2">
                    {MARKERS.map(marker => {
                      const selected = identity === marker.id;
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
                          <span>{marker.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {!isOnline ? <div className="text-sm text-warning">Offline. Verbindung fehlt.</div> : null}
                {errorMessage ? <div className="text-sm text-warning">{errorMessage}</div> : null}

                <Button
                  onClick={onJoinClick}
                  disabled={!code.trim() || status === "joining"}
                  size="lg"
                  className="w-full"
                >
                  {status === "joining" ? "Verbinden..." : "Beitreten"}
                </Button>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer brand="Langmeier Dreieck-1x1" />
    </div>
  );
}
