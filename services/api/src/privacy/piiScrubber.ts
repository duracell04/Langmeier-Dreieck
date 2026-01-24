// services/api/src/privacy/piiScrubber.ts
const PII_KEYS = ["name", "firstName", "lastName", "email", "phone", "address", "dob"];

export function assertNoPII(input: unknown): void {
  if (!input || typeof input !== "object") return;

  const stack: any[] = [input];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;

    for (const [k, v] of Object.entries(cur)) {
      if (PII_KEYS.includes(k)) {
        throw new Error(`PII field '${k}' is not allowed.`);
      }
      if (typeof v === "object" && v) stack.push(v);
    }
  }
}
