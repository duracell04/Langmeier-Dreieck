import React from "react";
import {
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
  buildCoreFamilies,
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
} from "@triangle/types";
import { IdbSessionStorage, getClassId, getDeviceId, getStudentRef } from "@triangle/storage";
import { createBaseEvent, recordEvent, syncPendingEvents, type EventContext } from "../services/practiceUseCases";

const SESSION_TOTAL = 25;
const SUCCESS_DWELL_MS = 700;
const REVEAL_DWELL_MS = 1600;
const REQUEUE_POLICY: RequeuePolicy = {
  minSpacing: 6,
  swapSpacing: 2,
  density: {
    maxConsecutive: 2,
    windowSize: 4,
    maxInWindow: 2,
  },
};
const PACK_ID = "core";
const SET_ID = "core";
const MODE: "learn" | "test" = "test";
const SQUARE_MODE: "default" | "single" = "default";

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
  const families = React.useMemo(() => buildCoreFamilies(), []);
  const learnPlan = React.useMemo(
    () => buildLearnPlan(families, { divisionEnabled: true, squareMode: SQUARE_MODE }),
    [families]
  );
  const sessionManager = React.useMemo(() => new SessionManager(new IdbSessionStorage()), []);

  const [sessionReady, setSessionReady] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [rngSeed, setRngSeed] = React.useState<number>(1);

  const rng = React.useMemo(() => createSeededRng(rngSeed), [rngSeed]);
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

  const scheduleSync = React.useCallback(() => {
    if (syncTimer.current) return;
    syncTimer.current = window.setTimeout(async () => {
      syncTimer.current = null;
      if (!eventContextRef.current) return;
      if (!navigator.onLine) return;
      try {
        await syncPendingEvents(syncConfig, eventContextRef.current);
      } catch {
        // keep working offline
      }
    }, 300);
  }, [syncConfig]);

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
    (async () => {
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
          packId: PACK_ID,
          mode: MODE,
          setId: SET_ID,
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
  }, [scheduleSync, sessionManager]);

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
        if (MODE === "learn" && learnPlan.length > 0) {
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
            squareMode: SQUARE_MODE,
            divisionEnabled: true,
          });
        }
      }

      recentFamiliesRef.current = [...recentFamiliesRef.current, selected.familyId].slice(-3);
      recentTasksRef.current = [...recentTasksRef.current, selected].slice(-3);
      recentSourcesRef.current = [...recentSourcesRef.current, source].slice(-REQUEUE_POLICY.density.windowSize);

      return selected;
    },
    [families, learnPlan, rng]
  );

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

  const handleCorrect = React.useCallback(() => {
    if (!task) return;
    setPhase("success");
    emitTaskEnd(task, "correct", attemptsBeforeEnd, structureUsed);
    sessionItemsRef.current += 1;
    sessionCorrectRef.current += 1;
    schedule(goNext, SUCCESS_DWELL_MS);
  }, [attemptsBeforeEnd, emitTaskEnd, goNext, schedule, structureUsed, task]);

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
  }, [emitTaskEnd, task]);

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
        <div className="text-sm text-muted">Lade...</div>
      </PracticeFrame>
    );
  }

  const correct = expectedAnswer(task);
  const progress = (taskIndex % SESSION_TOTAL) + 1;
  const [leftValue, rightValue] = task.pair;
  const productValue = leftValue * rightValue;
  const missingSlot = getMissingSlot(task.missing);
  const reveal = phase === "reveal";
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedLabel = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, "0")}`;

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
      ? "Nochmal versuchen."
      : phase === "structure"
        ? "Schauen wir auf die Struktur."
        : phase === "reveal"
          ? `Antwort: ${correct}`
          : phase === "success"
            ? "Richtig ✓"
            : undefined;

  const feedbackDetail = phase === "reveal" ? "Diese Aufgabe kommt wieder." : undefined;

  const gridVisible = phase === "structure" || phase === "reveal";
  const keypadDisabled = phase === "success";
  const feedbackState: FeedbackState = phase === "solve" ? "solve" : phase;

  const divisorValue = task.missing === "left" ? rightValue : leftValue;

  return (
    <PracticeFrame
      header={
        <>
          <div className="text-sm text-muted">
            {progress}/{SESSION_TOTAL}
          </div>
          {MODE === "test" ? <div className="text-sm text-muted">{elapsedLabel}</div> : null}
          <div className="text-sm text-muted">{isOnline ? "" : "Offline"}</div>
        </>
      }
      footer={
        <div className="mx-auto w-full max-w-md">
          <Keypad onKey={onKey} disabled={keypadDisabled} />
        </div>
      }
    >
      <div className="grid w-full place-items-center gap-6">
        <TriangleDisplay
          product={triangleProduct}
          factorA={triangleFactorA}
          factorB={triangleFactorB}
          missingSlot={missingSlot}
          lockedSlots={lockedSlots}
          operation={task.operation}
          status={triangleStatus}
        />

        {task.operation === "div" ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="tabular-nums text-ink">{productValue}</span>
            <span>:</span>
            <span className="rounded-swiss border border-dashed border-grid-border px-2 py-1 text-muted tabular-nums">
              {divisorValue}
            </span>
            <span>=</span>
            <span className="tabular-nums text-ink">{reveal ? correct : "?"}</span>
          </div>
        ) : null}

        <FeedbackLadder state={feedbackState} message={feedbackMessage} detail={feedbackDetail} />

        <StructureLensGrid visible={gridVisible} rows={leftValue} cols={rightValue} />
      </div>
    </PracticeFrame>
  );
}
