// services/api/src/routes/join.ts
import { assertNoPII } from "../privacy/piiScrubber";

export async function joinClass(reqBody: any) {
  assertNoPII(reqBody);

  const { joinCode, deviceId } = reqBody;
  if (!joinCode || !deviceId) throw new Error("Missing joinCode/deviceId");

  // Lookup classId by joinCode (DB)
  const classId = "class_123"; // placeholder

  // Issue opaque student token (studentRef)
  const studentRef = crypto.randomUUID().replace(/-/g, "").slice(0, 24);

  // Store mapping: classId + studentRef + firstSeenTs
  // NOTE: store NO names, NO email.
  // Assign studentNumber sequentially per class (teacher-friendly)
  const studentNumber = 1;

  return { classId, studentRef, studentNumber };
}
