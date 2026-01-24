// packages/core-engine/tests/simulation/simulateMastery.ts
import type { FamilyMastery } from "@triangle/types";
import { updateMastery } from "../../src/engine/mastery";

function mkMastery(familyId: string): FamilyMastery {
  return {
    familyId,
    bucket: 0,
    consecutiveCorrect: 0,
    lastSeenTs: Date.now(),
    dueTs: Date.now(),
    errors: {},
  };
}

function randBool(p: number) {
  return Math.random() < p;
}

export function runSimulation({
  students = 1000,
  families = 30,
  baseAccuracy = 0.7,
  stepsPerStudent = 400,
}) {
  const results: number[] = [];

  for (let s = 0; s < students; s++) {
    let masteredCount = 0;
    const mastery: Record<string, FamilyMastery> = {};
    for (let f = 0; f < families; f++) mastery[`F${f}`] = mkMastery(`F${f}`);

    for (let step = 0; step < stepsPerStudent; step++) {
      // pick a random family for simulation simplicity (real app uses picker)
      const fid = `F${Math.floor(Math.random() * families)}`;
      const fm = mastery[fid];

      const correct = randBool(baseAccuracy - fm.bucket * 0.03); // crude difficulty curve
      const attempt = {
        taskKey: `${fid}|mul|a×b|missing:left`,
        studentRef: `S${s}`,
        ts: Date.now() + step * 1000,
        answer: 0,
        correct,
        timeMs: 1200,
        operation: "mul" as const,
        errorType: correct ? undefined : "wrong_value" as const,
      };

      mastery[fid] = updateMastery(fm, attempt);

      // count bucket 4 as mastery
      masteredCount = Object.values(mastery).filter(m => m.bucket === 4).length;
      if (masteredCount === families) {
        results.push(step);
        break;
      }
      if (step === stepsPerStudent - 1) results.push(stepsPerStudent);
    }
  }

  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  const stuckRate = results.filter(x => x === stepsPerStudent).length / results.length;

  return { avgStepsToMasterAll: avg, stuckRate };
}

// quick CLI run
if (require.main === module) {
  console.log(runSimulation({}));
}
