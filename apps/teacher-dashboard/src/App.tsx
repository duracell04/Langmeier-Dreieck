import React from "react";
import {
  Badge,
  Button,
  Card,
  DashboardSection,
  DataTable,
} from "@triangle/ui-kit";
import { supabase } from "./services/supabaseClient";

interface ClassRow {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
}

interface KpiSummary {
  total: number;
  accuracy: number;
  reveals: number;
  bottlenecks: Array<{ product: number; revealRate: number; total: number }>;
}

function randomJoinCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function App() {
  const [session, setSession] = React.useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null>(null);
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [authLoading, setAuthLoading] = React.useState(false);

  const [classes, setClasses] = React.useState<ClassRow[]>([]);
  const [activeClassId, setActiveClassId] = React.useState<string | null>(null);
  const [className, setClassName] = React.useState("");
  const [classError, setClassError] = React.useState<string | null>(null);
  const [loadingClasses, setLoadingClasses] = React.useState(false);

  const [kpis, setKpis] = React.useState<KpiSummary | null>(null);
  const [loadingKpis, setLoadingKpis] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadClasses = React.useCallback(async () => {
    if (!session) return;
    setLoadingClasses(true);
    setClassError(null);
    const { data, error } = await supabase
      .from("classes")
      .select("id, name, join_code, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setClassError("Klassen konnten nicht geladen werden.");
      setLoadingClasses(false);
      return;
    }

    setClasses(data ?? []);
    if (!activeClassId && data && data.length > 0) {
      setActiveClassId(data[0].id);
    }
    setLoadingClasses(false);
  }, [activeClassId, session]);

  React.useEffect(() => {
    if (!session) return;
    loadClasses();
  }, [loadClasses, session]);

  const loadKpis = React.useCallback(async (classId: string) => {
    setLoadingKpis(true);
    const { data, error } = await supabase
      .from("task_end_events")
      .select("family_product, result")
      .eq("class_id", classId);

    if (error) {
      setKpis(null);
      setLoadingKpis(false);
      return;
    }

    let total = 0;
    let correct = 0;
    let reveals = 0;
    const perFamily = new Map<number, { total: number; reveals: number }>();

    for (const row of data ?? []) {
      total += 1;
      if (row.result === "correct") correct += 1;
      if (row.result === "reveal") reveals += 1;

      const product = Number(row.family_product);
      if (!Number.isFinite(product)) continue;
      const entry = perFamily.get(product) ?? { total: 0, reveals: 0 };
      entry.total += 1;
      if (row.result === "reveal") entry.reveals += 1;
      perFamily.set(product, entry);
    }

    const bottlenecks = [...perFamily.entries()]
      .map(([product, stats]) => ({
        product,
        total: stats.total,
        revealRate: stats.total > 0 ? stats.reveals / stats.total : 0,
      }))
      .sort((a, b) => b.revealRate - a.revealRate || b.total - a.total)
      .slice(0, 3);

    setKpis({
      total,
      accuracy: total > 0 ? correct / total : 0,
      reveals,
      bottlenecks,
    });
    setLoadingKpis(false);
  }, []);

  React.useEffect(() => {
    if (!activeClassId) return;
    loadKpis(activeClassId);
  }, [activeClassId, loadKpis]);

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);

    const action = authMode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });

    const { error } = await action;
    if (error) {
      setAuthError("Anmeldung nicht moeglich. Bitte pruefen.");
    }
    setAuthLoading(false);
  };

  const handleCreateClass = async () => {
    if (!session) return;
    const name = className.trim();
    if (!name) {
      setClassError("Klassenname fehlt.");
      return;
    }

    setClassError(null);
    setLoadingClasses(true);

    let created = false;
    for (let i = 0; i < 3; i += 1) {
      const joinCode = randomJoinCode();
      const { error } = await supabase.from("classes").insert({
        name,
        join_code: joinCode,
        teacher_id: session.user.id,
      });

      if (!error) {
        created = true;
        break;
      }
    }

    if (!created) {
      setClassError("Klasse konnte nicht erstellt werden.");
      setLoadingClasses(false);
      return;
    }

    setClassName("");
    await loadClasses();
    setLoadingClasses(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-bg text-ink font-sans">
        <div className="mx-auto grid w-full max-w-md gap-6 px-6 py-12">
          <header className="grid gap-2 text-center">
            <p className="text-micro uppercase tracking-wide text-muted">Dreieck-1x1</p>
            <h1 className="text-3xl font-semibold text-ink">Lehrperson Login</h1>
            <p className="text-sm text-muted">Nur fuer Lehrpersonen.</p>
          </header>

          <Card className="grid gap-4">
            <label className="grid gap-2 text-sm text-muted">
              E-Mail
              <input
                className="rounded-swiss border border-grid-border bg-surface px-3 py-2 text-ink"
                value={email}
                onChange={event => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Passwort
              <input
                className="rounded-swiss border border-grid-border bg-surface px-3 py-2 text-ink"
                value={password}
                onChange={event => setPassword(event.target.value)}
                type="password"
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
              />
            </label>

            {authError ? <div className="text-sm text-warning">{authError}</div> : null}

            <Button onClick={handleAuth} disabled={authLoading || !email || !password}>
              {authMode === "login" ? "Anmelden" : "Konto erstellen"}
            </Button>

            <div className="text-sm text-muted">
              {authMode === "login" ? "Noch kein Konto?" : "Schon registriert?"}
              <button
                type="button"
                className="ml-2 text-primary"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              >
                {authMode === "login" ? "Konto erstellen" : "Anmelden"}
              </button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const activeClass = classes.find(item => item.id === activeClassId);

  return (
    <main className="min-h-screen bg-bg text-ink font-sans">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-micro uppercase tracking-wide text-muted">Dreieck-1x1</p>
            <h1 className="text-3xl font-semibold text-ink">Uebersicht</h1>
            <div className="text-sm text-muted">{session.user.email}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSignOut}>Abmelden</Button>
          </div>
        </header>

        <DashboardSection title="Klassen">
          <Card className="grid gap-4" elevated>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-2 text-sm text-muted">
                Klassenname
                <input
                  className="rounded-swiss border border-grid-border bg-surface px-3 py-2 text-ink"
                  value={className}
                  onChange={event => setClassName(event.target.value)}
                  placeholder="Klasse 3a"
                />
              </label>
              <Button onClick={handleCreateClass} disabled={loadingClasses || !className.trim()}>
                Klasse erstellen
              </Button>
            </div>
            {classError ? <div className="text-sm text-warning">{classError}</div> : null}

            <div className="grid gap-2">
              {loadingClasses ? (
                <div className="text-sm text-muted">Lade Klassen...</div>
              ) : classes.length === 0 ? (
                <div className="text-sm text-muted">Noch keine Klassen.</div>
              ) : (
                classes.map(row => (
                  <button
                    key={row.id}
                    type="button"
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-swiss border px-3 py-2 text-left ${
                      row.id === activeClassId
                        ? "border-primary bg-surface"
                        : "border-grid-border bg-bg"
                    }`}
                    onClick={() => setActiveClassId(row.id)}
                  >
                    <div className="grid gap-1">
                      <div className="text-sm font-semibold text-ink">{row.name}</div>
                      <div className="text-micro text-muted">Code: {row.join_code}</div>
                    </div>
                    {row.id === activeClassId ? <Badge>Aktiv</Badge> : null}
                  </button>
                ))
              )}
            </div>
          </Card>
        </DashboardSection>

        <DashboardSection title="KPIs" action={activeClass ? <Badge>{activeClass.join_code}</Badge> : null}>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Aufgaben", value: kpis ? String(kpis.total) : "-" },
              {
                label: "Genauigkeit",
                value: kpis ? `${Math.round(kpis.accuracy * 100)}%` : "-",
              },
              {
                label: "Aufgedeckt",
                value: kpis ? String(kpis.reveals) : "-",
              },
            ].map(item => (
              <Card key={item.label} elevated>
                <div className="text-micro uppercase tracking-wide text-muted">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{item.value}</div>
              </Card>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Bottlenecks" action={loadingKpis ? <Badge>Aktualisieren...</Badge> : null}>
          <Card elevated className="grid gap-4">
            {activeClass ? (
              <div className="text-sm text-muted">Klasse: {activeClass.name}</div>
            ) : (
              <div className="text-sm text-muted">Keine Klasse gewaehlt.</div>
            )}
            <DataTable
              columns={[
                { key: "product", label: "Produkt" },
                { key: "revealRate", label: "Reveal-Quote", align: "right" },
                { key: "total", label: "Versuche", align: "right" },
              ]}
              rows={(kpis?.bottlenecks ?? []).map(row => ({
                product: row.product,
                revealRate: `${Math.round(row.revealRate * 100)}%`,
                total: row.total,
              }))}
            />
            {loadingKpis ? <div className="text-sm text-muted">Lade KPIs...</div> : null}
          </Card>
        </DashboardSection>
      </div>
    </main>
  );
}
