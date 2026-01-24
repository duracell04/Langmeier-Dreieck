import type { ErrorType, Task } from "@triangle/types";

export function computeCorrectAnswer(task: Task): number {
  const [a, b] = task.pair;
  if (task.missing === "product") return a * b;
  if (task.missing === "left") return a;
  return b;
}

export function classifyError(task: Task, answer: number): ErrorType | undefined {
  const correct = computeCorrectAnswer(task);
  if (answer === correct) return undefined;

  if (!Number.isFinite(answer) || answer < 0) return "plausibility";
  if (Math.abs(answer - correct) === 1) return "typo";

  if (task.missing === "product" && (answer === task.left || answer === task.right)) {
    return "wrong_family";
  }

  if (task.missing === "left" || task.missing === "right") {
    const other = task.missing === "left" ? task.right : task.left;
    if (other !== null && answer === other) {
      return task.operation === "div" ? "role_confusion" : "swapped_factors";
    }
  }

  if (task.operation === "div" && task.product !== null && answer === task.product) {
    return "role_confusion";
  }

  if (Math.abs(answer - correct) > Math.max(10, correct * 2)) {
    return "plausibility";
  }

  return "wrong_value";
}
