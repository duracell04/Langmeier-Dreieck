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
import { buildCoreFamilies, createSeedFromTime, createSeededRng, pickNextTask } from "@triangle/core-engine";
import type { FamilyMastery, Task as EngineTask } from "@triangle/types";

const SESSION_TOTAL = 25;
const ANSWER_REVEAL_MS = 1600;

function getMissingSlot(missing: EngineTask["missing"]): TriangleSlot {
  if (missing === "product") return "product";
  return missing === "left" ? "factorA" : "factorB";
}

function expectedAnswer(task: EngineTask): number {
  const [leftValue, rightValue] = task.pair;
  const productValue = leftValue * rightValue;
  if (task.missing === "product") return productValue;
  return task.missing === "left" ? leftValue : rightValue;
}

function formatSlot(value: number, isMissing: boolean, input: string, showCorrect: boolean, correct: number) {
  if (!isMissing) return String(value);
  if (showCorrect) return String(correct);
  return input.length ? input : "?";
}

export function Practice() {
  const families = React.useMemo(() => buildCoreFamilies(), []);
  const rngSeed = React.useMemo(() => {
    if (typeof window === "undefined") return 1;
    const key = "triangle.practice.seed";
    const stored = window.sessionStorage.getItem(key);
    const parsed = stored ? Number(stored) : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
    const seed = createSeedFromTime();
    window.sessionStorage.setItem(key, String(seed));
    return seed;
  }, []);
  const rng = React.useMemo(() => createSeededRng(rngSeed), [rngSeed]);
  const masteryRef = React.useRef<Record<string, FamilyMastery>>({});
  const recentRef = React.useRef<string[]>([]);

  const nextTask = React.useCallback(() => {
    const next = pickNextTask(families, masteryRef.current, {
      rng,
      recentFamilyIds: recentRef.current,
      operation: "mix",
      missing: "mix",
    });
    recentRef.current = [...recentRef.current, next.familyId].slice(-2);
    return next;
  }, [families, rng]);

  const [taskIndex, setTaskIndex] = React.useState(0);
  const [task, setTask] = React.useState<EngineTask>(() => nextTask());
  const [input, setInput] = React.useState("");
  const [attempts, setAttempts] = React.useState(0);
  const [feedback, setFeedback] = React.useState<FeedbackState>("idle");
  const [showCorrect, setShowCorrect] = React.useState(false);
  const [showStructure, setShowStructure] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(() => navigator.onLine);

  const timers = React.useRef<number[]>([]);

  const correct = expectedAnswer(task);
  const progress = (taskIndex % SESSION_TOTAL) + 1;
  const [leftValue, rightValue] = task.pair;
  const productValue = leftValue * rightValue;
  const missingSlot = getMissingSlot(task.missing);

  const clearTimers = React.useCallback(() => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
  }, []);

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

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  const resetForNext = React.useCallback(() => {
    clearTimers();
    setInput("");
    setAttempts(0);
    setFeedback("idle");
    setShowCorrect(false);
    setShowStructure(false);
  }, [clearTimers]);

  const goNext = React.useCallback(() => {
    setTaskIndex(i => i + 1);
    setTask(nextTask());
    resetForNext();
  }, [nextTask, resetForNext]);

  const handleCorrect = () => {
    setFeedback("correct");
    setShowCorrect(true);
    setShowStructure(false);
    schedule(goNext, 350);
  };

  const handleFirstWrong = () => {
    setAttempts(1);
    setFeedback("try_again");
    setInput("");
  };

  const handleSecondWrong = () => {
    setAttempts(2);
    setFeedback("structure");
    setShowStructure(true);
    setInput("");
  };

  const showAnswerAndAdvance = () => {
    setShowCorrect(true);
    setFeedback("show_answer");
    schedule(goNext, ANSWER_REVEAL_MS);
  };

  const submit = () => {
    if (!input.length || feedback === "correct" || feedback === "show_answer") return;
    const answer = Number(input);
    if (Number.isNaN(answer)) return;

    if (answer === correct) {
      handleCorrect();
      return;
    }

    if (attempts === 0) {
      handleFirstWrong();
      return;
    }

    if (attempts === 1) {
      handleSecondWrong();
      return;
    }

    showAnswerAndAdvance();
  };

  const onKey = (key: KeypadKey) => {
    if (feedback === "correct" || feedback === "show_answer") return;
    if (key === "enter") {
      submit();
      return;
    }
    if (key === "backspace") {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    setInput(prev => (prev + key).slice(0, 3));
  };

  const triangleProduct = formatSlot(productValue, missingSlot === "product", input, showCorrect, correct);
  const triangleFactorA = formatSlot(leftValue, missingSlot === "factorA", input, showCorrect, correct);
  const triangleFactorB = formatSlot(rightValue, missingSlot === "factorB", input, showCorrect, correct);

  const lockedSlots: TriangleSlot[] =
    task.operation === "div"
      ? missingSlot === "factorA"
        ? ["factorB"]
        : missingSlot === "factorB"
          ? ["factorA"]
          : []
      : [];

  const triangleStatus =
    feedback === "correct"
      ? "success"
      : feedback === "try_again" || feedback === "structure" || feedback === "show_answer"
        ? "hint"
        : "idle";

  const feedbackMessage =
    feedback === "try_again"
      ? "Nochmal versuchen"
      : feedback === "structure"
        ? "Schauen wir auf die Struktur"
        : feedback === "show_answer"
          ? `Antwort: ${correct}`
          : feedback === "correct"
            ? "Richtig"
            : undefined;

  const feedbackDetail = feedback === "show_answer" ? "Aufgabe kommt wieder" : undefined;

  return (
    <PracticeFrame
      header={
        <>
          <div className="text-sm text-muted">
            {progress}/{SESSION_TOTAL}
          </div>
          <div className="text-sm text-muted">{isOnline ? "" : "Offline"}</div>
        </>
      }
      footer={
        <div className="mx-auto w-full max-w-md">
          <Keypad
            onKey={onKey}
            disabled={feedback === "correct" || feedback === "show_answer"}
          />
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

        <FeedbackLadder state={feedback} message={feedbackMessage} detail={feedbackDetail} />

        <StructureLensGrid visible={showStructure} rows={leftValue} cols={rightValue} />

        {needsAck ? (
          <Button variant="secondary" onClick={goNext}>
            Verstanden
          </Button>
        ) : null}
      </div>
    </PracticeFrame>
  );
}
