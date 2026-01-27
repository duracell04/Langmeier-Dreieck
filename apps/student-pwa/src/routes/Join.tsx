import React from "react";
import { Button, Card, TextInput } from "@triangle/ui-kit";
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
  { id: "ink", label: "Dunkel", swatch: "bg-ink" },
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
  const [showDemoInfo, setShowDemoInfo] = React.useState(false);

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

  React.useEffect(() => {
    if (!showDemoInfo) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDemoInfo(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDemoInfo]);

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

  const onDemoStart = React.useCallback(() => {
    setShowDemoInfo(false);
    onJoin(PRIMARY_DEMO_JOIN_CODE);
  }, [onJoin]);

  const onDemoFill = React.useCallback(() => {
    setCode(PRIMARY_DEMO_JOIN_CODE);
    setShowDemoInfo(false);
  }, []);

  return (
    <main className="min-h-screen bg-bg text-ink font-sans">
      <div className="mx-auto grid w-full max-w-md gap-6 px-6 py-10">
        <header className="grid gap-2 text-center">
          <p className="text-micro uppercase tracking-wide text-muted">Dreieck-1x1</p>
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl font-semibold text-ink">Beitreten</h1>
            <button
              type="button"
              onClick={() => setShowDemoInfo(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-grid-border bg-surface text-sm font-semibold text-ink"
              aria-label="Demo Hinweise anzeigen"
            >
              i
            </button>
          </div>
          <p className="text-sm text-muted">Kein Login noetig.</p>
        </header>

        <Card className="grid gap-5">
          {stored ? (
            <div className="grid gap-2 rounded-swiss border border-grid-border bg-surface px-4 py-3 text-sm text-muted">
              <div>Letzte Klasse ist gespeichert.</div>
              <Button onClick={onContinue} disabled={status === "joining"}>
                Letzte Klasse wieder beitreten
              </Button>
            </div>
          ) : null}

          <label className="grid gap-2 text-sm text-muted">
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
            <div className="text-sm text-muted">Farbe waehlen (optional)</div>
            <div className="flex flex-wrap gap-2">
              {MARKERS.map(marker => (
                <button
                  key={marker.id}
                  type="button"
                  className={`flex items-center gap-2 rounded-swiss border px-3 py-2 text-sm ${
                    identity === marker.id
                      ? "border-primary bg-surface"
                      : "border-grid-border bg-bg"
                  }`}
                  aria-pressed={identity === marker.id}
                  onClick={() => setIdentity(prev => (prev === marker.id ? null : marker.id))}
                >
                  <span className={`h-3 w-3 rounded-full ${marker.swatch}`} aria-hidden="true" />
                  <span>{marker.label}</span>
                </button>
              ))}
            </div>
          </div>

          {!isOnline ? <div className="text-sm text-warning">Offline. Verbindung fehlt.</div> : null}
          {errorMessage ? <div className="text-sm text-warning">{errorMessage}</div> : null}

          <Button onClick={onJoinClick} disabled={!code.trim() || status === "joining"} className="w-full">
            {status === "joining" ? "Verbinden..." : "Beitreten"}
          </Button>
        </Card>
      </div>

      {showDemoInfo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDemoInfo(false)}
        >
          <div className="w-full max-w-md" onClick={event => event.stopPropagation()}>
            <Card className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-1">
                  <h2 className="text-lg font-semibold text-ink">Demo starten</h2>
                  <p className="text-sm text-muted">
                    Demo laeuft lokal mit fest verdrahteter Standard-Konfiguration.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm text-muted"
                  onClick={() => setShowDemoInfo(false)}
                  aria-label="Demo Hinweise schliessen"
                >
                  Schliessen
                </button>
              </div>

              <div className="grid gap-2 rounded-swiss border border-grid-border bg-bg px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted">Demo-Code</div>
                <div className="text-xl font-semibold tracking-[0.3em] text-ink">{PRIMARY_DEMO_JOIN_CODE}</div>
                <div className="text-xs text-muted">Direktlink: #/demo</div>
              </div>

              <div className="grid gap-2 text-sm text-muted">
                <div>Keine echte Klasse noetig.</div>
                <div>Events bleiben lokal und werden nicht synchronisiert.</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={onDemoFill}>
                  Code einsetzen
                </Button>
                <Button onClick={onDemoStart}>Demo starten</Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </main>
  );
}
