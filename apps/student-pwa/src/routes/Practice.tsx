import React from "react";
import {
  Badge,
  Button,
  FeedbackLadder,
  Keypad,
  PracticeFrame,
  StructureLensGrid,
  TriangleDisplay,
  type FeedbackState,
  type KeypadKey,
  type TriangleSlot,
} from "@triangle/ui-kit";
import {
  SessionManager,
  buildFamiliesForProductSets,
  buildLearnPlan,
  createSeedFromTime,
  createSeededRng,
  enqueueRequeue,
  pickDueRequeue,
  pickNextTask,
  shouldUseRequeue,
  taskFromBlueprint,
  type RequeueItem,
  type RequeuePolicy,
  type TaskSource,
} from "@triangle/core-engine";
import type {
  Attempt,
  HintUsedEvent,
  SessionEndEvent,
  SessionStartEvent,
  Task as EngineTask,
  TaskEndEvent,
  TaskEndMissingSlot,
  LockedRole,
  ProductSetId,
} from "@triangle/types";
import {
  IdbSessionStorage,
  getPracticeConfig,
  getClassConfig,
  getClassId,
  getDeviceId,
  getStudentRef,
  queryEvents,
  type ClassConfig,
  type PracticeConfig,
} from "@triangle/storage";
import { createBaseEvent, recordEvent, syncPendingEvents, type EventContext } from "../services/practiceUseCases";
import { sortProductSets } from "../services/productSets";
import { useI18n } from "../i18n";

const SUCCESS_DWELL_MS = 700;
const REVEAL_DWELL_MS = 1600;
const SPEED_DWELL_MS = {
  slow: { success: 900, reveal: 1800 },
  fast: { success: 500, reveal: 1400 },
} as const;
const REQUEUE_POLICY: RequeuePolicy = {
  minSpacing: 6,
  swapSpacing: 2,
  density: {
    maxConsecutive: 2,
    windowSize: 4,
    maxInWindow: 2,
  },
};
const DEFAULT_CLASS_CONFIG: ClassConfig = {
  packId: "core",
  defaultMode: "learn",
  productSets: ["products_3_4"],
  sessionLength: 25,
  divisionEnabled: true,
  squareMode: "default",
  allowStudentOverride: false,
};
const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  mode: DEFAULT_CLASS_CONFIG.defaultMode,
  productSets: DEFAULT_CLASS_CONFIG.productSets as ProductSetId[],
  speed: "slow",
};

type Phase = "solve" | "wrong1" | "structure" | "success" | "reveal";

function getMissingSlot(missing: EngineTask["missing"]): TriangleSlot {
  if (missing === "product") return "product";
  return missing === "left" ? "factorA" : "factorB";
}

function mapMissingSlot(missing: EngineTask["missing"]): TaskEndMissingSlot {
  if (missing === "product") return "product";
  return missing === "left" ? "factorLeft" : "factorRight";
}

function mapLockedRole(task: EngineTask): LockedRole {
  if (task.operation !== "div") return "none";
  if (task.missing === "left") return "divisorRight";
  return "divisorLeft";
}

function expectedAnswer(task: EngineTask): number {
  const [leftValue, rightValue] = task.pair;
  const productValue = leftValue * rightValue;
  if (task.missing === "product") return productValue;
  return task.missing === "left" ? leftValue : rightValue;
}

function formatSlot(value: number, isMissing: boolean, input: string, reveal: boolean, correct: number) {
  if (!isMissing) return String(value);
  if (reveal) return String(correct);
  return input.length ? input : "?";
}

export function Practice() {
  const { t } = useI18n();
  const sessionManager = React.useMemo(() => new SessionManager(new IdbSessionStorage()), []);

  const [sessionReady, setSessionReady] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [rngSeed, setRngSeed] = React.useState<number>(1);
  const [classConfig, setClassConfig] = React.useState<ClassConfig | null>(null);
  const [practiceConfig, setPracticeConfigState] = React.useState<PracticeConfig | null>(null);
  const [configReady, setConfigReady] = React.useState(false);
  const [sessionMode, setSessionMode] = React.useState<"learn" | "test">(DEFAULT_CLASS_CONFIG.defaultMode);
  const [selectedSets, setSelectedSets] = React.useState<ProductSetId[]>(DEFAULT_PRACTICE_CONFIG.productSets);
  const [speed, setSpeed] = React.useState<PracticeConfig["speed"]>(DEFAULT_PRACTICE_CONFIG.speed);

  const activeConfig = classConfig ?? DEFAULT_CLASS_CONFIG;
  const sessionTotal = activeConfig.sessionLength;
  const squareMode = activeConfig.squareMode;
  const divisionEnabled = activeConfig.divisionEnabled;
  const mode = sessionMode;
  const packId = activeConfig.packId;

  const families = React.useMemo(() => buildFamiliesForProductSets(selectedSets), [selectedSets]);

  const rng = React.useMemo(() => createSeededRng(rngSeed), [rngSeed]);
  const learnPlan = React.useMemo(
    () => buildLearnPlan(families, { divisionEnabled, squareMode }),
    [divisionEnabled, families, squareMode]
  );
  const masteryRef = React.useRef<Record<string, any>>({});
  const recentFamiliesRef = React.useRef<string[]>([]);
  const recentTasksRef = React.useRef<EngineTask[]>([]);
  const recentSourcesRef = React.useRef<TaskSource[]>([]);
  const requeueRef = React.useRef<RequeueItem[]>([]);
  const taskIndexRef = React.useRef(0);

  const eventContextRef = React.useRef<EventContext | null>(null);
  const sessionStartedAtRef = React.useRef<number>(Date.now());
  const taskShownAtRef = React.useRef<number>(Date.now());
  const sessionItemsRef = React.useRef(0);
  const sessionCorrectRef = React.useRef(0);

  const [taskIndex, setTaskIndex] = React.useState(0);
  const [task, setTask] = React.useState<EngineTask | null>(null);
  const [input, setInput] = React.useState("");
  const [attemptsBeforeEnd, setAttemptsBeforeEnd] = React.useState<0 | 1 | 2>(0);
  const [phase, setPhase] = React.useState<Phase>("solve");
  const [structureUsed, setStructureUsed] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(() => navigator.onLine);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [correctCount, setCorrectCount] = React.useState(0);

  const timers = React.useRef<number[]>([]);
  const syncTimer = React.useRef<number | null>(null);

  const syncConfig = React.useMemo(
    () => ({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
    }),
    []
  );

  const clearTimers = React.useCallback(() => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
    if (syncTimer.current) {
      window.clearTimeout(syncTimer.current);
      syncTimer.current = null;
    }
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  const runSync = React.useCallback(async () => {
    if (!eventContextRef.current) return;
    if (!navigator.onLine) return;
    try {
      await syncPendingEvents(syncConfig, eventContextRef.current);
    } catch {
      // Best-effort sync; UI stays minimal.
    }
  }, [syncConfig]);

  const scheduleSync = React.useCallback(() => {
    if (syncTimer.current) return;
    syncTimer.current = window.setTimeout(() => {
      syncTimer.current = null;
      runSync();
    }, 300);
  }, [runSync]);

  React.useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
      clearTimers();
    };
  }, [clearTimers]);

  React.useEffect(() => {
    let active = true;
    Promise.all([getClassConfig(), getPracticeConfig()]).then(([config, practice]) => {
      if (!active) return;
      setClassConfig(config ?? DEFAULT_CLASS_CONFIG);
      setPracticeConfigState(practice);
      setConfigReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!configReady) return;
      const baseConfig = classConfig ?? DEFAULT_CLASS_CONFIG;
      const allowOverride = baseConfig.allowStudentOverride ?? false;
      const basePractice = practiceConfig ?? DEFAULT_PRACTICE_CONFIG;
      const fallbackMode = allowOverride ? (basePractice.mode ?? baseConfig.defaultMode) : baseConfig.defaultMode;
      const fallbackSets = allowOverride
        ? (basePractice.productSets.length ? basePractice.productSets : baseConfig.productSets)
        : baseConfig.productSets;
      const orderedFallbackSets = sortProductSets(fallbackSets as ProductSetId[]);
      const fallbackSpeed = allowOverride ? (basePractice.speed ?? DEFAULT_PRACTICE_CONFIG.speed) : "slow";
      const [deviceId, studentRef, classId] = await Promise.all([
        getDeviceId(),
        getStudentRef(),
        getClassId(),
      ]);

      if (!deviceId || !studentRef) {
        if (active) window.location.hash = "#/";
        return;
      }

      const recovered = await sessionManager.recoverSession();
      let session = recovered;
      if (!session) {
        session = await sessionManager.startSession({
          sessionId: crypto.randomUUID(),
          studentRef,
          classId: classId ?? undefined,
          packId,
          mode: fallbackMode,
          setId: orderedFallbackSets.join("+"),
          productSets: orderedFallbackSets,
          speed: fallbackSpeed,
          startedAt: Date.now(),
          rngSeed: createSeedFromTime(),
        });
      }

      if (!active) return;

      eventContextRef.current = {
        deviceId,
        studentRef,
        classId: session.classId,
        packId: session.packId,
        sessionId: session.sessionId,
      };

      setSessionId(session.sessionId);
      setRngSeed(session.rngSeed);
      setSessionMode(session.mode);
      if (session.productSets && session.productSets.length) {
        setSelectedSets(sortProductSets(session.productSets as ProductSetId[]));
      } else {
        setSelectedSets(orderedFallbackSets as ProductSetId[]);
      }
      setSpeed(session.speed ?? fallbackSpeed);
      if (recovered) {
        const events = await queryEvents({ studentRef, sessionId: session.sessionId });
        const taskEnds = events.filter((event): event is TaskEndEvent => event.type === "task_end");
        const correct = taskEnds.filter(event => event.result === "correct").length;
        sessionItemsRef.current = taskEnds.length;
        sessionCorrectRef.current = correct;
        setCorrectCount(correct);
      } else {
        sessionItemsRef.current = 0;
        sessionCorrectRef.current = 0;
        setCorrectCount(0);
      }
      sessionStartedAtRef.current = session.startedAt;
      setSessionReady(true);

      if (!recovered) {
        const base = createBaseEvent(eventContextRef.current, "session_start");
        const event: SessionStartEvent = {
          ...base,
          type: "session_start",
          mode: session.mode,
          setId: session.setId,
        };
        await recordEvent(event);
        scheduleSync();
      }
    })();

    return () => {
      active = false;
    };
  }, [classConfig, configReady, packId, practiceConfig, scheduleSync, sessionManager]);

  const nextTask = React.useCallback(
    (nextIndex: number) => {
      const recentSources = recentSourcesRef.current;
      let selected: EngineTask | undefined;
      let source: TaskSource = "new";

      if (shouldUseRequeue(recentSources, REQUEUE_POLICY.density)) {
        const pick = pickDueRequeue(requeueRef.current, nextIndex, recentTasksRef.current, REQUEUE_POLICY);
        requeueRef.current = pick.queue;
        if (pick.task) {
          selected = pick.task;
          source = "requeue";
        }
      }

      if (!selected) {
        if (mode === "learn" && learnPlan.length > 0) {
          const planIndex = nextIndex % learnPlan.length;
          selected = taskFromBlueprint(families, learnPlan[planIndex], rng);
        } else {
          selected = pickNextTask(families, masteryRef.current, {
            rng,
            recentFamilyIds: recentFamiliesRef.current,
            recentTasks: recentTasksRef.current,
            recentFamilyWindow: 3,
            swapSpacing: REQUEUE_POLICY.swapSpacing,
            operation: "mix",
            missing: "mix",
            divisionMeaning: "mix",
            swap: "mix",
            squareMode,
            divisionEnabled,
          });
        }
      }

      recentFamiliesRef.current = [...recentFamiliesRef.current, selected.familyId].slice(-3);
      recentTasksRef.current = [...recentTasksRef.current, selected].slice(-3);
      recentSourcesRef.current = [...recentSourcesRef.current, source].slice(-REQUEUE_POLICY.density.windowSize);

      return selected;
    },
    [divisionEnabled, families, learnPlan, mode, rng, squareMode]
  );

  React.useEffect(() => {
    if (!sessionReady || task) return;
    const next = nextTask(0);
    setTask(next);
  }, [nextTask, sessionReady, task]);

  React.useEffect(() => {
    taskIndexRef.current = taskIndex;
  }, [taskIndex]);

  React.useEffect(() => {
    if (!task || !eventContextRef.current) return;

    taskShownAtRef.current = Date.now();
    setElapsedMs(0);

    const base = createBaseEvent(eventContextRef.current, "task_shown");
    const event = {
      ...base,
      type: "task_shown",
      taskKey: task.taskKey,
      familyId: task.familyId,
      operation: task.operation,
      missing: task.missing,
    };
    recordEvent(event);
    scheduleSync();
  }, [task, scheduleSync]);

  React.useEffect(() => {
    if (!task) return undefined;
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - taskShownAtRef.current);
    }, 200);
    return () => window.clearInterval(id);
  }, [task]);

  React.useEffect(() => {
    return () => {
      if (!eventContextRef.current || !sessionId) return;
      const items = sessionItemsRef.current;
      const correct = sessionCorrectRef.current;
      const accuracy = items > 0 ? correct / items : 0;
      const base = createBaseEvent(eventContextRef.current, "session_end");
      const event: SessionEndEvent = {
        ...base,
        type: "session_end",
        durationMs: Date.now() - sessionStartedAtRef.current,
        items,
        accuracy,
      };
      recordEvent(event);
      scheduleSync();
      sessionManager.endSession(sessionId);
    };
  }, [scheduleSync, sessionId, sessionManager]);

  const resetForNext = React.useCallback(() => {
    clearTimers();
    setInput("");
    setAttemptsBeforeEnd(0);
    setPhase("solve");
    setStructureUsed(false);
  }, [clearTimers]);

  const goNext = React.useCallback(() => {
    const nextIndex = taskIndexRef.current + 1;
    const next = nextTask(nextIndex);
    setTaskIndex(nextIndex);
    setTask(next);
    resetForNext();
    if (sessionId) {
      sessionManager.touch(sessionId);
    }
  }, [nextTask, resetForNext, sessionId, sessionManager]);

  const emitAttempt = React.useCallback(
    (task: EngineTask, answer: number, correct: boolean) => {
      if (!eventContextRef.current) return;
      const attempt: Attempt = {
        taskKey: task.taskKey,
        studentRef: eventContextRef.current.studentRef,
        ts: Date.now(),
        answer,
        correct,
        timeMs: Date.now() - taskShownAtRef.current,
        operation: task.operation,
        errorType: correct ? undefined : "wrong_value",
        scaffoldUsed: structureUsed,
      };

      const base = createBaseEvent(eventContextRef.current, "attempt_submitted");
      const event = {
        ...base,
        type: "attempt_submitted",
        attempt,
      };
      recordEvent(event);
      scheduleSync();
    },
    [scheduleSync, structureUsed]
  );

  const emitTaskEnd = React.useCallback(
    (task: EngineTask, result: "correct" | "reveal", attempts: 0 | 1 | 2, usedStructure: boolean) => {
      if (!eventContextRef.current) return;
      const [leftValue, rightValue] = task.pair;
      const productValue = leftValue * rightValue;
      const base = createBaseEvent(eventContextRef.current, "task_end");
      const event: TaskEndEvent = {
        ...base,
        type: "task_end",
        taskId: task.instanceId,
        familyProduct: productValue,
        op: task.operation,
        missing: mapMissingSlot(task.missing),
        lockedRole: mapLockedRole(task),
        attemptsBeforeEnd: attempts,
        usedStructureLens: usedStructure,
        msToEnd: Date.now() - taskShownAtRef.current,
        result,
      };
      recordEvent(event);
      scheduleSync();
    },
    [scheduleSync]
  );

  const emitStructureHint = React.useCallback(
    (task: EngineTask) => {
      if (!eventContextRef.current) return;
      const base = createBaseEvent(eventContextRef.current, "hint_used");
      const event: HintUsedEvent = {
        ...base,
        type: "hint_used",
        hintType: "structure_lens",
        taskKey: task.taskKey,
      };
      recordEvent(event);
      scheduleSync();
    },
    [scheduleSync]
  );

  const successDwellMs = mode === "test" ? SPEED_DWELL_MS[speed].success : SUCCESS_DWELL_MS;
  const revealDwellMs = mode === "test" ? SPEED_DWELL_MS[speed].reveal : REVEAL_DWELL_MS;

  const handleCorrect = React.useCallback(() => {
    if (!task) return;
    setPhase("success");
    emitTaskEnd(task, "correct", attemptsBeforeEnd, structureUsed);
    sessionItemsRef.current += 1;
    sessionCorrectRef.current += 1;
    setCorrectCount(sessionCorrectRef.current);
    if (sessionItemsRef.current >= sessionTotal) {
      schedule(() => {
        window.location.hash = "#/results";
      }, successDwellMs);
      return;
    }
    schedule(goNext, successDwellMs);
  }, [attemptsBeforeEnd, emitTaskEnd, goNext, schedule, sessionTotal, structureUsed, successDwellMs, task]);

  const handleFirstWrong = React.useCallback(() => {
    setAttemptsBeforeEnd(1);
    setPhase("wrong1");
    setInput("");
  }, []);

  const handleSecondWrong = React.useCallback(() => {
    if (task) emitStructureHint(task);
    setAttemptsBeforeEnd(2);
    setPhase("structure");
    setStructureUsed(true);
    setInput("");
  }, [emitStructureHint, task]);

  const handleReveal = React.useCallback(() => {
    if (!task) return;
    setPhase("reveal");
    setStructureUsed(true);
    emitTaskEnd(task, "reveal", 2, true);
    sessionItemsRef.current += 1;

    const cloned: EngineTask = {
      ...task,
      instanceId: `${task.instanceId}|rq|${crypto.randomUUID()}`,
    };
    requeueRef.current = enqueueRequeue(
      requeueRef.current,
      cloned,
      taskIndexRef.current,
      REQUEUE_POLICY.minSpacing
    );
    if (sessionItemsRef.current >= sessionTotal) {
      schedule(() => {
        window.location.hash = "#/results";
      }, revealDwellMs);
      return;
    }
    schedule(goNext, revealDwellMs);
  }, [emitTaskEnd, goNext, revealDwellMs, schedule, sessionTotal, task]);

  const submit = React.useCallback(() => {
    if (!task) return;
    if (!input.length) return;
    if (phase === "success") return;

    const answer = Number(input);
    if (Number.isNaN(answer)) return;

    if (sessionId) {
      sessionManager.touch(sessionId);
    }

    const correct = answer === expectedAnswer(task);
    emitAttempt(task, answer, correct);

    if (phase === "reveal") {
      if (correct) {
        goNext();
      } else {
        setInput("");
      }
      return;
    }

    if (correct) {
      handleCorrect();
      return;
    }

    if (attemptsBeforeEnd === 0) {
      handleFirstWrong();
      return;
    }

    if (attemptsBeforeEnd === 1) {
      handleSecondWrong();
      return;
    }

    handleReveal();
  }, [
    attemptsBeforeEnd,
    emitAttempt,
    handleCorrect,
    handleFirstWrong,
    handleReveal,
    handleSecondWrong,
    input,
    phase,
    sessionId,
    sessionManager,
    task,
  ]);

  const onKey = React.useCallback(
    (key: KeypadKey) => {
      if (phase === "success" || phase === "reveal") return;
      if (key === "clear") {
        setInput("");
        return;
      }
      if (key === "enter") {
        submit();
        return;
      }
      if (key === "backspace") {
        setInput(prev => prev.slice(0, -1));
        return;
      }
      setInput(prev => (prev + key).slice(0, 3));
    },
    [phase, submit]
  );

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onKey("enter");
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        onKey("backspace");
        return;
      }
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        onKey(event.key as KeypadKey);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKey]);

  if (!task) {
    return (
      <PracticeFrame>
        <div className="text-sm text-muted-foreground">{t("practice.loading")}</div>
      </PracticeFrame>
    );
  }

  const correct = expectedAnswer(task);
  const progress = (taskIndex % sessionTotal) + 1;
  const [leftValue, rightValue] = task.pair;
  const productValue = leftValue * rightValue;
  const missingSlot = getMissingSlot(task.missing);
  const reveal = phase === "reveal";
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedLabel = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const inputDisplay = input.length ? input : "—";
  const progressSegments = Math.max(1, Math.min(sessionTotal, 6));
  const filledSegments = Math.min(
    progressSegments,
    Math.max(1, Math.round((progress / sessionTotal) * progressSegments))
  );

  const sharedInput = Boolean(task.squareSharedInput && (missingSlot === "factorA" || missingSlot === "factorB"));
  const triangleProduct = formatSlot(productValue, missingSlot === "product", input, reveal, correct);
  const triangleFactorA = formatSlot(leftValue, sharedInput || missingSlot === "factorA", input, reveal, correct);
  const triangleFactorB = formatSlot(rightValue, sharedInput || missingSlot === "factorB", input, reveal, correct);

  const lockedSlots: TriangleSlot[] =
    task.operation === "div"
      ? missingSlot === "factorA"
        ? ["factorB"]
        : missingSlot === "factorB"
          ? ["factorA"]
          : []
      : [];

  const triangleStatus =
    phase === "success"
      ? "success"
      : phase === "wrong1" || phase === "structure" || phase === "reveal"
        ? "hint"
        : "idle";

  const feedbackMessage =
    phase === "wrong1"
      ? t("practice.feedback.tryAgain")
      : phase === "structure"
        ? t("practice.feedback.structure")
        : phase === "reveal"
          ? t("practice.feedback.answer", { answer: correct })
          : phase === "success"
            ? t("practice.feedback.correct")
            : undefined;

  const feedbackDetail = phase === "reveal" ? t("practice.feedback.requeue") : undefined;

  const gridVisible = phase === "structure" || phase === "reveal";
  const keypadDisabled = phase === "success" || phase === "reveal";
  const feedbackState: FeedbackState = phase === "solve" ? "solve" : phase;

  const equationMissing = reveal ? correct : "?";
  const equationLeft =
    task.operation === "mul" ? (task.missing === "left" ? equationMissing : leftValue) : productValue;
  const equationRight =
    task.operation === "mul"
      ? (task.missing === "right" ? equationMissing : rightValue)
      : task.missing === "left"
        ? rightValue
        : leftValue;
  const equationResult =
    task.operation === "mul"
      ? task.missing === "product"
        ? equationMissing
        : productValue
      : equationMissing;
  const equationSymbol = task.operation === "mul" ? "\u00D7" : ":";

  return (
    <PracticeFrame
      footerMode="fixed-mobile"
      header={
        <>
          <div className="grid gap-1 text-xs text-muted-foreground">
            <span>{t("practice.progress", { current: progress, total: sessionTotal })}</span>
            <span>{t("practice.correctCount", { count: correctCount })}</span>
          </div>
          {mode === "test" ? <div className="text-xs text-muted-foreground">{elapsedLabel}</div> : null}
          {!isOnline ? <Badge>{t("practice.status.offline")}</Badge> : null}
        </>
      }
      footer={
        <div className="mx-auto w-full max-w-md">
          <div className="card-elevated p-5 sm:p-6">
            <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("practice.answerLabel")}
            </div>
            <div
              className={cn(
                "mt-4 flex min-h-touch items-center justify-center rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-center text-2xl font-semibold",
                input.length ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              {inputDisplay}
            </div>
            <div className="mt-4">
              <Keypad onKey={onKey} disabled={keypadDisabled} showEnter={false} showClear />
            </div>
            <Button
              variant="hero"
              size="lg"
              className="mt-4 w-full"
              onClick={submit}
              disabled={keypadDisabled || !input.length}
            >
              {t("practice.submit")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex w-full flex-col items-center gap-6">
        <div className="w-full max-w-sm">
          <div className="flex gap-2">
            {Array.from({ length: progressSegments }, (_, index) => (
              <div
                key={`segment-${index}`}
                className={cn(
                  "h-2 flex-1 rounded-full transition-subtle",
                  index < filledSegments ? "bg-primary/40" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <div className="card-elevated w-full max-w-sm px-6 py-8 md:px-8">
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("practice.taskHeader", { current: progress, total: sessionTotal })}
          </div>

          <div className="mt-6 flex justify-center">
            <TriangleDisplay
              product={triangleProduct}
              factorA={triangleFactorA}
              factorB={triangleFactorB}
              missingSlot={missingSlot}
              lockedSlots={lockedSlots}
              operation={task.operation}
              status={triangleStatus}
            />
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-base text-muted-foreground">
            <span className="tabular-nums text-ink">{equationLeft}</span>
            <span>{equationSymbol}</span>
            <span
              className={
                task.operation === "div"
                  ? "rounded-lg border border-dashed border-border/60 bg-card px-2 py-1 text-muted-foreground tabular-nums"
                  : "tabular-nums text-ink"
              }
            >
              {equationRight}
            </span>
            <span>=</span>
            <span className="tabular-nums text-ink">{equationResult}</span>
          </div>

          {feedbackState !== "solve" || feedbackMessage || feedbackDetail ? (
            <div className="mt-5">
              <FeedbackLadder state={feedbackState} message={feedbackMessage} detail={feedbackDetail} />
            </div>
          ) : null}
        </div>

        {gridVisible ? (
          <div className="card-elevated w-full max-w-sm px-5 py-6 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("practice.structureLabel")}
            </div>
            <div className="mt-4 flex justify-center">
              <StructureLensGrid
                visible={gridVisible}
                rows={leftValue}
                cols={rightValue}
                showNumbers
                highlight="both"
                outlineFilledRegion
                gridSize={Math.max(6, Math.min(10, Math.max(leftValue, rightValue)))}
              />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {leftValue} \u00D7 {rightValue} = {productValue}
            </div>
          </div>
        ) : null}
      </div>
    </PracticeFrame>
  );
}




