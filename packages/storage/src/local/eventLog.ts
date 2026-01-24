import type { StudentEvent } from "@triangle/types";
import { openDb, STORE_EVENTS } from "./idb";

export interface EventQuery {
  studentRef?: string;
  sessionId?: string;
  sinceTs?: number;
  limit?: number;
}

async function withEventsStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => Promise<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EVENTS, mode);
    const store = tx.objectStore(STORE_EVENTS);

    run(store)
      .then(result => {
        tx.oncomplete = () => {
          db.close();
          resolve(result);
        };
      })
      .catch(err => {
        tx.abort();
        reject(err);
      });

    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function addEvent(store: IDBObjectStore, event: StudentEvent): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const request = store.add(event);
    request.onsuccess = () => resolve(true);
    request.onerror = () => {
      if (request.error && request.error.name === "ConstraintError") {
        resolve(false);
        return;
      }
      reject(request.error);
    };
  });
}

export async function appendEvent(event: StudentEvent): Promise<boolean> {
  return withEventsStore("readwrite", store => addEvent(store, event));
}

export async function appendEvents(events: StudentEvent[]): Promise<number> {
  return withEventsStore("readwrite", async store => {
    let inserted = 0;
    for (const e of events) {
      const ok = await addEvent(store, e);
      if (ok) inserted += 1;
    }
    return inserted;
  });
}

export async function queryEvents(query: EventQuery): Promise<StudentEvent[]> {
  return withEventsStore("readonly", async store => {
    let source: IDBIndex | IDBObjectStore = store;
    let range: IDBKeyRange | undefined;

    if (query.studentRef && query.sessionId) {
      source = store.index("by_student_session");
      range = IDBKeyRange.only([query.studentRef, query.sessionId]);
    } else if (query.studentRef) {
      source = store.index("by_studentRef");
      range = IDBKeyRange.only(query.studentRef);
    } else if (query.sessionId) {
      source = store.index("by_sessionId");
      range = IDBKeyRange.only(query.sessionId);
    }

    const results: StudentEvent[] = [];
    const limit = query.limit ?? Infinity;

    await new Promise<void>((resolve, reject) => {
      const request = source.openCursor(range);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve();
          return;
        }
        const event = cursor.value as StudentEvent;
        if (query.sinceTs && event.ts < query.sinceTs) {
          cursor.continue();
          return;
        }
        results.push(event);
        if (results.length >= limit) {
          resolve();
          return;
        }
        cursor.continue();
      };
    });

    return results;
  });
}

export async function clearEvents(): Promise<void> {
  await withEventsStore("readwrite", store => new Promise<void>((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }));
}
