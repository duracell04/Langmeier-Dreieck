import { z } from "https://esm.sh/zod@3.23.8";

export const ProductSetIdSchema = z.enum([
  "products_3_4",
  "products_2",
  "squares",
  "cardinals",
  "all_products",
]);

export const ClassDefaultsSchema = z.object({
  packId: z.string().min(1),
  defaultMode: z.enum(["learn", "test"]),
  productSets: z.array(ProductSetIdSchema).min(1),
  sessionLength: z.union([z.literal(10), z.literal(25), z.literal(40)]),
  divisionEnabled: z.boolean(),
  squareMode: z.enum(["default", "single"]),
});

export const JoinClassRequestSchema = z.object({
  joinCode: z.string().min(3).max(12),
  deviceId: z.string().min(6).optional(),
});

export const BaseEventSchema = z.object({
  version: z.literal(1),
  type: z.string(),
  eventId: z.string().min(10),
  ts: z.number().int().positive(),
  at: z.number().int().positive().optional(),
  deviceId: z.string().min(10),
  studentRef: z.string().min(6),
  classId: z.string().optional(),
  packId: z.string().min(1),
  sessionId: z.string().min(6),
});

export const StudentEventSchema = z.discriminatedUnion("type", [
  BaseEventSchema.extend({
    type: z.literal("session_start"),
    mode: z.enum(["learn", "test"]),
    setId: z.string(),
  }),
  BaseEventSchema.extend({
    type: z.literal("task_shown"),
    taskKey: z.string(),
    familyId: z.string(),
    operation: z.enum(["mul", "div"]),
    missing: z.enum(["product", "left", "right"]),
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
      operation: z.enum(["mul", "div"]),
      errorType: z
        .enum([
          "wrong_value",
          "role_confusion",
          "swapped_factors",
          "wrong_family",
          "plausibility",
          "typo",
        ])
        .optional(),
      scaffoldUsed: z.boolean().optional(),
    }),
  }),
  BaseEventSchema.extend({
    type: z.literal("hint_used"),
    hintType: z.enum(["family_glance", "structure_lens"]),
    taskKey: z.string().optional(),
  }),
  BaseEventSchema.extend({
    type: z.literal("task_end"),
    taskId: z.string(),
    familyProduct: z.number().int().nonnegative(),
    op: z.enum(["mul", "div"]),
    missing: z.enum(["product", "factorLeft", "factorRight"]),
    lockedRole: z.enum(["none", "divisorLeft", "divisorRight", "quotientLeft", "quotientRight"]),
    attemptsBeforeEnd: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    usedStructureLens: z.boolean(),
    msToEnd: z.number().int().nonnegative(),
    result: z.enum(["correct", "reveal"]),
  }),
  BaseEventSchema.extend({
    type: z.literal("session_end"),
    durationMs: z.number().int().nonnegative(),
    items: z.number().int().nonnegative(),
    accuracy: z.number().min(0).max(1),
  }),
]);

export const SubmitEventsRequestSchema = z.object({
  classId: z.string().min(1),
  studentRef: z.string().min(1),
  events: z.array(StudentEventSchema).min(1).max(500),
  cursorTs: z.number().int().positive().optional(),
});

export type JoinClassRequest = z.infer<typeof JoinClassRequestSchema>;
export type SubmitEventsRequest = z.infer<typeof SubmitEventsRequestSchema>;
