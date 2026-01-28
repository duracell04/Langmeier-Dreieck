import React from "react";
import { Badge, Button, Card } from "@triangle/ui-kit";
import { computeGamification } from "@triangle/core-engine";
import type { SessionEndEvent, StudentEvent, TaskEndEvent } from "@triangle/types";
import { queryEvents, getStudentRef } from "@triangle/storage";
import { joinClass, loadStoredIdentity } from "../services/joinUseCases";
import { useI18n } from "../i18n";
import { LanguageToggle } from "../ui/LanguageToggle";

type Summary = {
  total: number;
  correct: number;
  reveals: number;
  accuracy: number;
  durationMs?: number;
};

function isTaskEndEvent(event: StudentEvent): event is TaskEndEvent {
  return event.type === "task_end";
}

function isSessionEndEvent(event: StudentEvent): event is SessionEndEvent {
  return event.type === "session_end";
}

export function Results() {
  const { t } = useI18n();
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [badges, setBadges] = React.useState<Array<{ id: string; label: string }>>([]);
  const [stored, setStored] = React.useState<Awaited<ReturnType<typeof loadStoredIdentity>> | null>(null);
  const [status, setStatus] = React.useState<"idle" | "joining" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    loadStoredIdentity().then(identity => {
      if (active) setStored(identity);
    });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const studentRef = await getStudentRef();
      if (!studentRef) {
        if (active) setSummary(null);
        return;
      }

      const events = await queryEvents({ studentRef });
      const sorted = [...events].sort((a, b) => a.ts - b.ts);
      const lastSessionEnd = [...sorted].reverse().find(isSessionEndEvent);
      const lastTaskEnd = [...sorted].reverse().find(isTaskEndEvent);
      const sessionId = lastSessionEnd?.sessionId ?? lastTaskEnd?.sessionId;

      const taskEnds = sorted.filter(isTaskEndEvent).filter(event => !sessionId || event.sessionId === sessionId);
      const total = taskEnds.length;
      const correct = taskEnds.filter(event => event.result === "correct").length;
      const reveals = taskEnds.filter(event => event.result === "reveal").length;
      const accuracy = total > 0 ? correct / total : 0;

      const sessionEndDuration = lastSessionEnd?.durationMs;
      const gamification = computeGamification(taskEnds);

      if (!active) return;
      setSummary({ total, correct, reveals, accuracy, durationMs: sessionEndDuration });
      setBadges(gamification.badgesUnlocked ?? []);
    })();

    return () => {
      active = false;
    };
  }, []);

  const onRetry = () => {
    window.location.hash = "#/practice";
  };

  const onHome = () => {
    window.location.hash = "#/";
  };

  const onRejoin = async () => {
    if (!stored) return;
    setStatus("joining");
    setErrorMessage(null);
    if (!navigator.onLine) {
      window.location.hash = "#/practice";
      return;
    }
    try {
      await joinClass(stored.joinCode, stored.identityMarker);
      window.location.hash = "#/practice";
    } catch {
      setStatus("error");
      setErrorMessage(t("results.errors.joinFailed"));
    }
  };

  return (
    <main className="min-h-screen bg-bg text-ink font-sans">
      <div className="mx-auto grid w-full max-w-2xl gap-6 px-6 py-10">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <header className="grid gap-2 text-center">
          <p className="text-micro uppercase tracking-wide text-muted">{t("landing.hero.eyebrow")}</p>
          <h1 className="text-3xl font-semibold text-ink">{t("results.title")}</h1>
          <p className="text-sm text-muted">{t("results.subtitle")}</p>
        </header>

        <Card className="grid gap-4">
          {summary ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-swiss border border-grid-border bg-surface px-3 py-3">
                <div className="text-micro uppercase tracking-wide text-muted">{t("results.labels.tasks")}</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{summary.total}</div>
              </div>
              <div className="rounded-swiss border border-grid-border bg-surface px-3 py-3">
                <div className="text-micro uppercase tracking-wide text-muted">{t("results.labels.accuracy")}</div>
                <div className="mt-2 text-2xl font-semibold text-ink">
                  {Math.round(summary.accuracy * 100)}%
                </div>
              </div>
              <div className="rounded-swiss border border-grid-border bg-surface px-3 py-3">
                <div className="text-micro uppercase tracking-wide text-muted">{t("results.labels.revealed")}</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{summary.reveals}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted">{t("results.empty")}</div>
          )}

          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <Badge key={badge.id}>{badge.label}</Badge>
              ))}
            </div>
          ) : null}

          {errorMessage ? <div className="text-sm text-warning">{errorMessage}</div> : null}
        </Card>

        <div className="grid gap-3">
          <Button onClick={onRetry}>{t("results.actions.retry")}</Button>
          <Button variant="secondary" onClick={onHome}>{t("results.actions.home")}</Button>
          {stored ? (
            <Button variant="ghost" onClick={onRejoin} disabled={status === "joining"}>
              {t("results.actions.rejoin")}
            </Button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
