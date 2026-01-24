import { test, expect } from "@playwright/test";

test("offline session works and syncs later", async ({ page, context }) => {
  await page.goto("http://localhost:5173");

  // join or quick practice
  // ...
  // go offline
  await context.setOffline(true);

  // complete some items
  // ...
  // end session shows summary
  // expect(...)

  // back online
  await context.setOffline(false);

  // trigger sync (app should do it opportunistically)
  // ...
  // verify server received events (in test env you can check a mock endpoint)
});
