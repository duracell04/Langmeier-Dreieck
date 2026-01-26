import React from "react";
import { Triangle } from "../ui/Triangle";
import { Keypad } from "../ui/Keypad";
import { StructureLensGrid } from "../ui/StructureLensGrid";
import { FeedbackFlash } from "../ui/FeedbackFlash";

type Operation = "mul" | "div";

type Task = {
  id: string;
  operation: Operation;
  product: number;
  left: number;
  right: number;
  missing: "product" | "left" | "right";
};

const TASKS: Task[] = [
  { id: "t1", operation: "mul", product: 24, left: 6, right: 4, missing: "product" },
  { id: "t2", operation: "mul", product: 24, left: 6, right: 4, missing: "left" },
  { id: "t3", operation: "div", product: 24, left: 6, right: 4, missing: "right" },
  { id: "t4", operation: "div", product: 24, left: 6, right: 4, missing: "left" },
];

function expectedAnswer(t: Task): number {
  if (t.missing === "product") return t.left * t.right;
  if (t.missing === "left") return t.product / t.right;
  return t.product / t.left;
}

function formatSlot(value: number | null, isMissing: boolean, input: string, showCorrect: boolean, correct: number) {
  if (!isMissing) return String(value ?? "");
  if (showCorrect) return String(correct);
  return input.length ? input : "?";
}

export function Practice() {
  const [taskIndex, setTaskIndex] = React.useState(0);
  const [input, setInput] = React.useState("");
  const [attempts, setAttempts] = React.useState(0);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [tone, setTone] = React.useState<"neutral" | "warning" | "success">("neutral");
  const [showCorrect, setShowCorrect] = React.useState(false);
  const [showStructure, setShowStructure] = React.useState(false);
  const [flashActive, setFlashActive] = React.useState(false);

  const task = TASKS[taskIndex % TASKS.length];
  const correct = expectedAnswer(task);

  React.useEffect(() => {
    let t: number | undefined;
    if (flashActive) {
      t = window.setTimeout(() => {
        setFlashActive(false);
        setShowCorrect(true);
        setFeedback("Correct answer shown");
        setTone("neutral");
      }, 700);
    }
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [flashActive]);

  const resetForNext = () => {
    setInput("");
    setAttempts(0);
    setFeedback(null);
    setTone("neutral");
    setShowCorrect(false);
    setShowStructure(false);
    setFlashActive(false);
  };

  const goNext = () => {
    setTaskIndex(i => i + 1);
    resetForNext();
  };

  const submit = () => {
    if (!input.length || showCorrect) return;
    const answer = Number(input);
    if (Number.isNaN(answer)) return;

    if (answer === correct) {
      setFeedback("Correct");
      setTone("success");
      setShowCorrect(true);
      return;
    }

    if (attempts === 0) {
      setAttempts(1);
      setFeedback("Try again");
      setTone("warning");
      return;
    }

    if (attempts === 1) {
      setAttempts(2);
      setFeedback("Structure flash");
      setTone("warning");
      setShowStructure(true);
      setFlashActive(true);
      return;
    }
  };

  const onKey = (key: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "clear" | "back" | "enter") => {
    if (key === "enter") {
      submit();
      return;
    }
    if (key === "clear") {
      setInput("");
      return;
    }
    if (key === "back") {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    setInput(prev => (prev + key).slice(0, 3));
  };

  const opSymbol = task.operation === "mul" ? "x" : "/";

  const triangleProduct = formatSlot(task.product, task.missing === "product", input, showCorrect, correct);
  const triangleLeft = formatSlot(task.left, task.missing === "left", input, showCorrect, correct);
  const triangleRight = formatSlot(task.right, task.missing === "right", input, showCorrect, correct);

  const lockedSlots: Array<"product" | "left" | "right"> = task.operation === "div" ? ["product"] : [];
  const triangleStatus = tone === "success" ? "success" : tone === "warning" ? "hint" : "idle";

  return (
    <main style={{ display: "grid", gap: 18, padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Practice</h1>
        <button type="button" onClick={() => (window.location.hash = "#/")}>Exit</button>
      </header>

      <section style={{ display: "grid", gap: 12 }}>
        <div style={{ fontSize: 18 }}>
          Task {taskIndex + 1} &middot; {task.product} {opSymbol} {task.left} = {task.right}
        </div>

        <Triangle
          product={triangleProduct}
          left={triangleLeft}
          right={triangleRight}
          missing={task.missing}
          lockedSlots={lockedSlots}
          operation={task.operation}
          status={triangleStatus}
        />

        {feedback ? <FeedbackFlash message={feedback} tone={tone} /> : null}
        <StructureLensGrid visible={showStructure || flashActive} rows={task.left} cols={task.right} />
      </section>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 220px" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 24, minHeight: 32 }}>Answer: {input || ""}</div>
          <button type="button" onClick={submit} disabled={showCorrect}>
            Check
          </button>
          <button type="button" onClick={goNext} disabled={!showCorrect}>
            Next
          </button>
        </div>
        <Keypad onKey={onKey} />
      </section>
    </main>
  );
}
