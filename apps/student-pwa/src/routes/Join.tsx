import React from "react";
import { Button, Card, TextInput } from "@triangle/ui-kit";
import {
  clearStoredIdentity,
  joinClass,
  loadStoredIdentity,
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

  const onJoin = React.useCallback(async () => {
    if (!code.trim()) return;
    setStatus("joining");
    setErrorMessage(null);
    try {
      await joinClass(code.trim(), identity);
      window.location.hash = "#/practice";
    } catch {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setErrorMessage(
        offline
          ? "Offline. Bitte spaeter verbinden."
          : "Beitritt nicht moeglich. Bitte Code pruefen."
      );
      setStatus("error");
    }
  }, [code, identity]);

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
    <main className="min-h-screen bg-bg text-ink font-sans">
      <div className="mx-auto grid w-full max-w-md gap-6 px-6 py-10">
        <header className="grid gap-2 text-center">
          <p className="text-micro uppercase tracking-wide text-muted">Dreieck-1x1</p>
          <h1 className="text-3xl font-semibold text-ink">Beitreten</h1>
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

          <Button onClick={onJoin} disabled={!code.trim() || status === "joining"} className="w-full">
            {status === "joining" ? "Verbinden..." : "Beitreten"}
          </Button>
        </Card>
      </div>
    </main>
  );
}
