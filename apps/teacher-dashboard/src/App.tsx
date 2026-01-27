import React from "react";
import {
  Badge,
  Button,
  Card,
  DashboardSection,
  DataTable,
} from "@triangle/ui-kit";
import { supabase } from "./services/supabaseClient";

type ProductSetId = "products_3_4" | "products_2" | "squares" | "cardinals" | "all_products";

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
  perStudent: Array<{ studentLabel: string; total: number; accuracy: number; reveals: number }>;
}

const PRODUCT_SET_OPTIONS: Array<{ id: ProductSetId; label: string }> = [
  { id: "products_3_4", label: "Produkte 3/4" },
  { id: "products_2", label: "Produkte 2" },
  { id: "squares", label: "Quadrate" },
  { id: "cardinals", label: "Kardinale" },
  { id: "all_products", label: "Alle Produkte" },
];

const SESSION_LENGTHS = [10, 25, 40] as const;

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
  const [defaultMode, setDefaultMode] = React.useState<"learn" | "test">("learn");
  const [sessionLength, setSessionLength] = React.useState<(typeof SESSION_LENGTHS)[number]>(25);
  const [divisionEnabled, setDivisionEnabled] = React.useState(true);
  const [squareMode, setSquareMode] = React.useState<"default" | "single">("default");
  const [productSets, setProductSets] = React.useState<ProductSetId[]>(["products_3_4"]);

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
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("student_ref, student_number")
      .eq("class_id", classId);

    if (studentsError) {
      setKpis(null);
      setLoadingKpis(false);
      return;
    }

    const studentMap = new Map<string, number>();
    for (const row of studentsData ?? []) {
      if (typeof row.student_ref === "string" && typeof row.student_number === "number") {
        studentMap.set(row.student_ref, row.student_number);
      }
    }

    const { data, error } = await supabase
      .from("task_end_events")
      .select("family_product, result, student_ref")
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
    const perStudent = new Map<string, { total: number; correct: number; reveals: number }>();

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

      const studentRef = typeof row.student_ref === "string" ? row.student_ref : null;
      if (studentRef) {
        const studentEntry = perStudent.get(studentRef) ?? { total: 0, correct: 0, reveals: 0 };
        studentEntry.total += 1;
        if (row.result === "correct") studentEntry.correct += 1;
        if (row.result === "reveal") studentEntry.reveals += 1;
        perStudent.set(studentRef, studentEntry);
      }
    }

    const bottlenecks = [...perFamily.entries()]
      .map(([product, stats]) => ({
        product,
        total: stats.total,
        revealRate: stats.total > 0 ? stats.reveals / stats.total : 0,
      }))
      .sort((a, b) => b.revealRate - a.revealRate || b.total - a.total)
      .slice(0, 3);

    const perStudentRows = [...perStudent.entries()]
      .map(([studentRef, stats]) => {
        const number = studentMap.get(studentRef);
        const label = number ? `Schueler ${number}` : "Schueler ?";
        return {
          studentLabel: label,
          total: stats.total,
          accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
          reveals: stats.reveals,
        };
      })
      .sort((a, b) => b.reveals - a.reveals || b.total - a.total);

    setKpis({
      total,
      accuracy: total > 0 ? correct / total : 0,
      reveals,
      bottlenecks,
      perStudent: perStudentRows,
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
    if (productSets.length === 0) {
      setClassError("Mindestens ein Produktset waehlen.");
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
        pack_id: "core",
        default_mode: defaultMode,
        product_sets: productSets,
        session_length: sessionLength,
        division_enabled: divisionEnabled,
        square_mode: squareMode,
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
  const studentAppUrl = (import.meta.env.VITE_STUDENT_APP_URL as string | undefined) ?? "";
  const fallbackBase =
    typeof window !== "undefined" && window.location
      ? `${window.location.protocol}//${window.location.hostname}${
          window.location.port === "5174" ? ":5173" : window.location.port ? `:${window.location.port}` : ""
        }`
      : "";
  const joinBase = (studentAppUrl || fallbackBase).replace(/\/$/, "");
  const joinUrl = activeClass ? `${joinBase}/?code=${activeClass.join_code}` : "";

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
            <div className="grid gap-4 rounded-swiss border border-grid-border bg-bg px-4 py-4">
              <div className="text-sm font-semibold text-ink">Standardeinstellungen</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-muted">
                  Modus
                  <select
                    className="rounded-swiss border border-grid-border bg-surface px-3 py-2 text-ink"
                    value={defaultMode}
                    onChange={event => setDefaultMode(event.target.value as "learn" | "test")}
                  >
                    <option value="learn">Lernen</option>
                    <option value="test">Test</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-muted">
                  Sitzungslaenge
                  <select
                    className="rounded-swiss border border-grid-border bg-surface px-3 py-2 text-ink"
                    value={sessionLength}
                    onChange={event => setSessionLength(Number(event.target.value) as (typeof SESSION_LENGTHS)[number])}
                  >
                    {SESSION_LENGTHS.map(value => (
                      <option key={value} value={value}>
                        {value} Aufgaben
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-2">
                <div className="text-sm text-muted">Produktsets</div>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_SET_OPTIONS.map(option => {
                    const selected = productSets.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`rounded-swiss border px-3 py-2 text-sm ${
                          selected ? "border-primary bg-surface" : "border-grid-border bg-bg"
                        }`}
                        aria-pressed={selected}
                        onClick={() => {
                          setProductSets(prev =>
                            prev.includes(option.id)
                              ? prev.filter(item => item !== option.id)
                              : [...prev, option.id]
                          );
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-grid-border"
                    checked={divisionEnabled}
                    onChange={event => setDivisionEnabled(event.target.checked)}
                  />
                  Division aktiv
                </label>
                <label className="grid gap-2 text-sm text-muted">
                  Quadrate
                  <select
                    className="rounded-swiss border border-grid-border bg-surface px-3 py-2 text-ink"
                    value={squareMode}
                    onChange={event => setSquareMode(event.target.value as "default" | "single")}
                  >
                    <option value="default">Standard</option>
                    <option value="single">Ein Feld fuer beide Faktoren</option>
                  </select>
                </label>
              </div>
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

        <DashboardSection title="Beitritt">
          <Card elevated className="grid gap-4">
            {activeClass ? (
              <>
                <div className="text-sm text-muted">Klasse: {activeClass.name}</div>
                <div className="grid gap-2">
                  <div className="text-micro uppercase tracking-wide text-muted">Join-Code</div>
                  <div className="text-3xl font-semibold text-ink">{activeClass.join_code}</div>
                </div>
                <div className="grid gap-2">
                  <div className="text-micro uppercase tracking-wide text-muted">Join-URL</div>
                  <div className="rounded-swiss border border-grid-border bg-surface px-3 py-2 text-sm text-ink break-all">
                    {joinUrl || "Studenten-URL fehlt. Bitte VITE_STUDENT_APP_URL setzen."}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted">Keine Klasse gewaehlt.</div>
            )}
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

        <DashboardSection title="Schuelerinnen und Schueler">
          <Card elevated className="grid gap-4">
            <DataTable
              columns={[
                { key: "studentLabel", label: "Schueler" },
                { key: "accuracy", label: "Genauigkeit", align: "right" },
                { key: "reveals", label: "Aufgedeckt", align: "right" },
                { key: "total", label: "Versuche", align: "right" },
              ]}
              rows={(kpis?.perStudent ?? []).map(row => ({
                studentLabel: row.studentLabel,
                accuracy: `${Math.round(row.accuracy * 100)}%`,
                reveals: row.reveals,
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
