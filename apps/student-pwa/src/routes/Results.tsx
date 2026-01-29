import React from "react";
import { Badge, Button, Card } from "@triangle/ui-kit";
import { computeGamification, recommendNextStep } from "@triangle/core-engine";
import type { SessionEndEvent, SessionStartEvent, StudentEvent, TaskEndEvent } from "@triangle/types";
import { getPracticeConfig, getStudentRef, queryEvents } from "@triangle/storage";
import { useI18n } from "../i18n";
import { LanguageToggle } from "../ui/LanguageToggle";

type Summary = {
  total: number;
  correct: number;
  reveals: number;
  accuracy: number;
  durationMs?: number;
  mode?: "learn" | "test";
  speed?: "slow" | "fast";
};

function isTaskEndEvent(event: StudentEvent): event is TaskEndEvent {
  return event.type === "task_end";
}

function isSessionEndEvent(event: StudentEvent): event is SessionEndEvent {
  return event.type === "session_end";
}

function isSessionStartEvent(event: StudentEvent): event is SessionStartEvent {
  return event.type === "session_start";
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function Results() {
  const { t } = useI18n();
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [badges, setBadges] = React.useState<Array<{ id: string; label: string }>>([]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const [studentRef, practiceConfig] = await Promise.all([getStudentRef(), getPracticeConfig()]);
      if (!studentRef) {
        if (active) setSummary(null);
        return;
      }

      const events = await queryEvents({ studentRef });
      const sorted = [...events].sort((a, b) => a.ts - b.ts);
      const lastSessionEnd = [...sorted].reverse().find(isSessionEndEvent);
      const lastTaskEnd = [...sorted].reverse().find(isTaskEndEvent);
      const sessionId = lastSessionEnd?.sessionId ?? lastTaskEnd?.sessionId;
      const lastSessionStart = [...sorted]
        .reverse()
        .filter(isSessionStartEvent)
        .find(event => !sessionId || event.sessionId === sessionId);

      const taskEnds = sorted.filter(isTaskEndEvent).filter(event => !sessionId || event.sessionId === sessionId);
      const total = taskEnds.length;
      const correct = taskEnds.filter(event => event.result === "correct").length;
      const reveals = taskEnds.filter(event => event.result === "reveal").length;
      const accuracy = total > 0 ? correct / total : 0;

      const sessionEndDuration = lastSessionEnd?.durationMs;
      const gamification = computeGamification(taskEnds);
      const mode = lastSessionStart?.mode ?? practiceConfig?.mode;
      const speed = practiceConfig?.speed ?? "slow";

      if (!active) return;
      setSummary({ total, correct, reveals, accuracy, durationMs: sessionEndDuration, mode, speed });
      setBadges(gamification.badgesUnlocked ?? []);
    })();

    return () => {
      active = false;
    };
  }, []);

  const onRepeat = () => {
    window.location.hash = "#/practice";
  };

  const onSelect = () => {
    window.location.hash = "#/select";
  };

  const nextStep = summary
    ? recommendNextStep({
        total: summary.total,
        reveals: summary.reveals,
        accuracy: summary.accuracy,
        mode: summary.mode,
      })
    : null;
  const speedLabel =
    summary?.speed === "fast" ? t("practice.selection.speedFast") : t("practice.selection.speedSlow");
  const durationLabel = summary?.durationMs != null ? formatDuration(summary.durationMs) : null;

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

          {summary?.mode === "test" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {durationLabel ? (
                <div className="rounded-swiss border border-grid-border bg-surface px-3 py-3">
                  <div className="text-micro uppercase tracking-wide text-muted">{t("results.labels.time")}</div>
                  <div className="mt-2 text-2xl font-semibold text-ink">{durationLabel}</div>
                </div>
              ) : null}
              <div className="rounded-swiss border border-grid-border bg-surface px-3 py-3">
                <div className="text-micro uppercase tracking-wide text-muted">{t("results.labels.speed")}</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{speedLabel}</div>
              </div>
            </div>
          ) : null}

          {nextStep ? <div className="text-sm text-muted">{t(`results.next.${nextStep}`)}</div> : null}

          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <Badge key={badge.id}>{badge.label}</Badge>
              ))}
            </div>
          ) : null}
        </Card>

        <div className="grid gap-3">
          <Button onClick={onRepeat}>{t("results.actions.repeat")}</Button>
          <Button variant="secondary" onClick={onSelect}>{t("results.actions.select")}</Button>
        </div>
      </div>
    </main>
  );
}
