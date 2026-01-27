import type { Task } from "@triangle/types";

export type TaskSource = "new" | "requeue";

export interface RequeueItem {
  dueIndex: number;
  task: Task;
}

export interface RequeueDensityPolicy {
  maxConsecutive: number;
  windowSize: number;
  maxInWindow: number;
}

export interface RequeuePolicy {
  minSpacing: number;
  swapSpacing: number;
  density: RequeueDensityPolicy;
}

export function enqueueRequeue(queue: RequeueItem[], task: Task, currentIndex: number, minSpacing: number): RequeueItem[] {
  const next = [...queue, { dueIndex: currentIndex + minSpacing, task }];
  next.sort((a, b) => a.dueIndex - b.dueIndex);
  return next;
}

export function shouldUseRequeue(recentSources: TaskSource[], density: RequeueDensityPolicy): boolean {
  const window = recentSources.slice(-density.windowSize);
  const requeueCount = window.filter(source => source === "requeue").length;
  let consecutive = 0;
  for (let i = recentSources.length - 1; i >= 0; i -= 1) {
    if (recentSources[i] !== "requeue") break;
    consecutive += 1;
  }
  return consecutive < density.maxConsecutive && requeueCount < density.maxInWindow;
}

function isSwapPair(a: Task, b: Task): boolean {
  if (a.operation !== "mul" || b.operation !== "mul") return false;
  if (a.familyId !== b.familyId) return false;
  const [aL, aR] = a.pair;
  const [bL, bR] = b.pair;
  if (aL === aR) return false;
  return aL === bR && aR === bL;
}

function violatesSwapSpacing(task: Task, recentTasks: Task[], spacing: number): boolean {
  const window = recentTasks.slice(-spacing);
  return window.some(prev => isSwapPair(task, prev));
}

export function pickDueRequeue(
  queue: RequeueItem[],
  nextIndex: number,
  recentTasks: Task[],
  policy: RequeuePolicy
): { task?: Task; queue: RequeueItem[] } {
  if (!queue.length) return { queue };

  const sorted = [...queue].sort((a, b) => a.dueIndex - b.dueIndex);
  const updated: RequeueItem[] = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const item = sorted[i];
    if (item.dueIndex > nextIndex) {
      updated.push(...sorted.slice(i));
      return { queue: updated };
    }

    if (policy.swapSpacing > 0 && violatesSwapSpacing(item.task, recentTasks, policy.swapSpacing)) {
      updated.push({ ...item, dueIndex: nextIndex + 1 });
      continue;
    }

    updated.push(...sorted.slice(i + 1));
    return { task: item.task, queue: updated };
  }

  return { queue: updated };
}
