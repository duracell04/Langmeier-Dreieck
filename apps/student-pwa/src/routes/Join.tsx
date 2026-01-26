import React from "react";
import { Button, Card, TextInput } from "@triangle/ui-kit";

const IDENTITIES = ["🌿", "🌞", "🔵", "⭐️", "🐚"];

export function Join() {
  const [code, setCode] = React.useState("");
  const [identity, setIdentity] = React.useState<string | null>(null);

  const onJoin = () => {
    window.location.hash = "#/practice";
  };

  return (
    <main className="min-h-screen bg-bg text-ink font-sans">
      <div className="mx-auto grid w-full max-w-md gap-6 px-6 py-10">
        <header className="grid gap-2 text-center">
          <p className="text-micro uppercase tracking-wide text-muted">Dreieck‑1×1</p>
          <h1 className="text-3xl font-semibold text-ink">Beitreten</h1>
          <p className="text-sm text-muted">Kein Login nötig.</p>
        </header>

        <Card className="grid gap-5">
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
            <div className="text-sm text-muted">Wähle ein Zeichen (optional)</div>
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

          <Button onClick={onJoin} disabled={!code.trim()} className="w-full">
            Beitreten
          </Button>
        </Card>
      </div>
    </main>
  );
}
