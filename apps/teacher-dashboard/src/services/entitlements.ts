export type EntitlementTier = "free" | "pro";

export type EntitlementSource = "override" | "local" | "class" | "free";

export interface EntitlementState {
  tier: EntitlementTier;
  source: EntitlementSource;
}

export interface PaymentsCheckoutResult {
  status: "success" | "cancelled";
}

export interface PaymentsClient {
  startCheckout: (input: { plan: EntitlementTier }) => Promise<PaymentsCheckoutResult>;
}

const LOCAL_STORAGE_KEY = "triangle_entitlement_tier";

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage ?? null;
}

export function getStoredEntitlement(): EntitlementTier | null {
  const storage = safeLocalStorage();
  if (!storage) return null;
  const value = storage.getItem(LOCAL_STORAGE_KEY);
  if (value === "pro" || value === "free") return value;
  return null;
}

export function setStoredEntitlement(tier: EntitlementTier | null): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  if (!tier) {
    storage.removeItem(LOCAL_STORAGE_KEY);
    return;
  }
  storage.setItem(LOCAL_STORAGE_KEY, tier);
}

export function resolveEntitlement(classSettings?: Record<string, unknown> | null): EntitlementState {
  const override = (import.meta.env.VITE_ENTITLEMENT_OVERRIDE as string | undefined)?.toLowerCase();
  if (override === "pro" || override === "free") {
    return { tier: override, source: "override" };
  }

  const stored = getStoredEntitlement();
  if (stored) {
    return { tier: stored, source: "local" };
  }

  const paid = classSettings && typeof classSettings.paid === "boolean" ? classSettings.paid : false;
  if (paid) {
    return { tier: "pro", source: "class" };
  }

  return { tier: "free", source: "free" };
}

export function createPaymentsClient(): PaymentsClient {
  return {
    async startCheckout(input) {
      // TODO: replace with Stripe checkout session + webhook that sets class.settings.paid = true.
      if (input.plan === "pro") {
        setStoredEntitlement("pro");
        return { status: "success" };
      }
      setStoredEntitlement("free");
      return { status: "cancelled" };
    },
  };
}
