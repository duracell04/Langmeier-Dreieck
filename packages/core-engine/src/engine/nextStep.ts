export type NextStepRecommendation = "learnSame" | "testSlow" | "keepGoing";

export interface NextStepInput {
  total: number;
  reveals: number;
  accuracy: number;
  mode?: "learn" | "test";
}

export function recommendNextStep(input: NextStepInput): NextStepRecommendation {
  if (input.total <= 0) return "keepGoing";

  const revealRate = input.total > 0 ? input.reveals / input.total : 0;
  if (input.reveals >= 3 || revealRate >= 0.2) return "learnSame";

  if (input.accuracy >= 0.9 && input.reveals <= 1) return "testSlow";

  return "keepGoing";
}
