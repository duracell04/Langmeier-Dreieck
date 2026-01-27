// packages/storage/src/events/validator.ts
import { z } from "zod";

export const BaseEventSchema = z.object({
  version: z.literal(1),
  type: z.string(),
  eventId: z.string().min(10),
  ts: z.number().int().positive(),
  at: z.number().int().positive().optional(),
  deviceId: z.string().min(10),
  studentRef: z.string().min(6),
  classId: z.string().optional(),
  packId: z.string().min(3),
  sessionId: z.string().min(10),
});

export const StudentEventSchema = z.discriminatedUnion("type", [
  BaseEventSchema.extend({
    type: z.literal("session_start"),
    mode: z.union([z.literal("learn"), z.literal("test")]),
    setId: z.string(),
  }),
  BaseEventSchema.extend({
    type: z.literal("task_shown"),
    taskKey: z.string(),
    familyId: z.string(),
    operation: z.union([z.literal("mul"), z.literal("div")]),
    missing: z.union([z.literal("product"), z.literal("left"), z.literal("right")]),
  }),
  BaseEventSchema.extend({
    type: z.literal("attempt_submitted"),
    attempt: z.object({
      taskKey: z.string(),
      studentRef: z.string(),
      ts: z.number().int().positive(),
      answer: z.number().int(),
      correct: z.boolean(),
      timeMs: z.number().int().nonnegative(),
      operation: z.union([z.literal("mul"), z.literal("div")]),
      errorType: z
        .union([
          z.literal("wrong_value"),
          z.literal("role_confusion"),
          z.literal("swapped_factors"),
          z.literal("wrong_family"),
          z.literal("plausibility"),
          z.literal("typo"),
        ])
        .optional(),
      scaffoldUsed: z.boolean().optional(),
    }),
  }),
  BaseEventSchema.extend({
    type: z.literal("hint_used"),
    hintType: z.union([z.literal("family_glance"), z.literal("structure_lens")]),
    taskKey: z.string().optional(),
  }),
  BaseEventSchema.extend({
    type: z.literal("task_end"),
    taskId: z.string(),
    familyProduct: z.number().int().nonnegative(),
    op: z.union([z.literal("mul"), z.literal("div")]),
    missing: z.union([z.literal("product"), z.literal("factorLeft"), z.literal("factorRight")]),
    lockedRole: z.union([z.literal("none"), z.literal("divisorLeft"), z.literal("divisorRight")]),
    attemptsBeforeEnd: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    usedStructureLens: z.boolean(),
    msToEnd: z.number().int().nonnegative(),
    result: z.union([z.literal("correct"), z.literal("reveal")]),
  }),
  BaseEventSchema.extend({
    type: z.literal("session_end"),
    durationMs: z.number().int().nonnegative(),
    items: z.number().int().nonnegative(),
    accuracy: z.number().min(0).max(1),
  }),
]);

export type StudentEventRuntime = z.infer<typeof StudentEventSchema>;
