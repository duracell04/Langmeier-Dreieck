import { afterEach, describe, expect, it, vi } from "vitest";
import { submitEvents } from "../src/remote/syncClient";
import type { StudentEvent } from "@triangle/types";

const baseEvent: StudentEvent = {
  version: 1,
  type: "session_start",
  eventId: "event-1234567890",
  ts: 1000,
  at: 1000,
  deviceId: "device-1234567890",
  studentRef: "student-abcdef",
  classId: "class-123",
  packId: "core",
  sessionId: "session-123456",
  mode: "learn",
  setId: "core",
};

describe("submitEvents", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to submit_events and returns server counters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accepted: 2, deduped: 1, serverTs: 1234 }),
    });

    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const result = await submitEvents(
      { supabaseUrl: "https://example.com", supabaseAnonKey: "anon" },
      { classId: "class-123", studentRef: "student-abcdef", events: [baseEvent], cursorTs: 100 }
    );

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.com/functions/v1/submit_events");
    const body = JSON.parse(options.body as string);
    expect(body.cursorTs).toBe(100);
    expect(result).toEqual({ accepted: 2, deduped: 1, serverTs: 1234 });
  });
});
