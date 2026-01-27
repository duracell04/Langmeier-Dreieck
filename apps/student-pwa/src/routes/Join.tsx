import React from "react";
import { Button, Card, TextInput } from "@triangle/ui-kit";
import { joinClass, loadStoredIdentity, type JoinClassResult } from "../services/joinUseCases";

const IDENTITIES = ["??", "??", "??", "??", "??"];

export function Join() {
  const [code, setCode] = React.useState("");
  const [identity, setIdentity] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "joining" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [stored, setStored] = React.useState<JoinClassResult | null>(null);

  React.useEffect(() => {
    let active = true;
    loadStoredIdentity().then(result => {
      if (active) setStored(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const onJoin = async () => {
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
          ? "Offline. Bitte Verbindung pruefen."
          : "Beitritt nicht moeglich. Bitte Code pruefen."
      );
      setStatus("error");
    }
  };

  const onContinue = () => {
    window.location.hash = "#/practice";
  };

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
              <div>Bereits verbunden.</div>
              <Button onClick={onContinue}>Weiter</Button>
            </div>
          ) : null}

          <label className="grid gap-2 text-sm text-muted">
            Code
            <TextInput
              value={code}
              onChange={event => setCode(event.target.value)}
              placeholder="Code eingeben"
              autoComplete="off"
              inputMode="text"
              maxLength={6}
            />
          </label>

          <div className="grid gap-2">
            <div className="text-sm text-muted">Zeichen waehlen (optional)</div>
            <div className="flex flex-wrap gap-2">
              {IDENTITIES.map(token => (
                <Button
                  key={token}
                  variant={identity === token ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={identity === token}
                  onClick={() => setIdentity(prev => (prev === token ? null : token))}
                >
                  {token}
                </Button>
              ))}
            </div>
          </div>

          {errorMessage ? <div className="text-sm text-warning">{errorMessage}</div> : null}

          <Button onClick={onJoin} disabled={!code.trim() || status === "joining"} className="w-full">
            {status === "joining" ? "Verbinden..." : "Beitreten"}
          </Button>
        </Card>
      </div>
    </main>
  );
}
