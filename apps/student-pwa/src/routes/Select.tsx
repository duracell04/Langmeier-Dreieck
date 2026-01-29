import React from "react";
import { Badge, Button, Card, Container, Footer, Navbar, Section } from "@triangle/ui-kit";
import { getClassConfig, getPracticeConfig, getStudentRef, setPracticeConfig, type ClassConfig } from "@triangle/storage";
import type { PracticeConfig } from "@triangle/storage";
import type { ProductSetId } from "@triangle/types";
import { useI18n } from "../i18n";
import { LanguageToggle } from "../ui/LanguageToggle";
import { PRODUCT_SET_ORDER, sortProductSets } from "../services/productSets";

const DEFAULT_CLASS_CONFIG: ClassConfig = {
  packId: "core",
  defaultMode: "learn",
  productSets: ["products_3_4"],
  sessionLength: 25,
  divisionEnabled: true,
  squareMode: "default",
  allowStudentOverride: false,
};

const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  mode: "learn",
  productSets: ["products_3_4"],
  speed: "slow",
};

function expandAllProducts(selected: ProductSetId[], allowed: ProductSetId[]): ProductSetId[] {
  if (selected.includes("all_products")) {
    return sortProductSets([...new Set(allowed)]);
  }
  return sortProductSets(selected.length ? selected : allowed);
}

export function Select() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const copyright = t("common.copyright", { year, brand: t("common.brand") });
  const [classConfig, setClassConfigState] = React.useState<ClassConfig | null>(null);
  const [mode, setMode] = React.useState<"learn" | "test">("learn");
  const [speed, setSpeed] = React.useState<PracticeConfig["speed"]>("slow");
  const [selectedSets, setSelectedSets] = React.useState<ProductSetId[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOnline, setIsOnline] = React.useState(() => navigator.onLine);

  React.useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const [storedConfig, storedPractice, studentRef] = await Promise.all([
        getClassConfig(),
        getPracticeConfig(),
        getStudentRef(),
      ]);

      if (!studentRef) {
        window.location.hash = "#/join";
        return;
      }

      const baseConfig = storedConfig ?? DEFAULT_CLASS_CONFIG;
      const allowOverride = baseConfig.allowStudentOverride ?? false;
      const allowed = baseConfig.productSets.length ? baseConfig.productSets : DEFAULT_CLASS_CONFIG.productSets;
      const basePractice = storedPractice ?? {
        ...DEFAULT_PRACTICE_CONFIG,
        mode: baseConfig.defaultMode,
        productSets: allowed,
      };

      if (!active) return;
      setClassConfigState(baseConfig);

      const resolvedMode = allowOverride ? basePractice.mode : baseConfig.defaultMode;
      const resolvedSpeed = allowOverride ? (basePractice.speed ?? "slow") : "slow";
      const initialSets = allowOverride
        ? basePractice.productSets.filter(setId => allowed.includes(setId))
        : allowed;
      const resolvedSets = expandAllProducts(initialSets.length ? initialSets : allowed, allowed);

      setMode(resolvedMode);
      setSpeed(resolvedSpeed);
      setSelectedSets(resolvedSets);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const allowStudentOverride = classConfig?.allowStudentOverride ?? false;
  const allowedSets = classConfig?.productSets ?? DEFAULT_CLASS_CONFIG.productSets;
  const orderedSets = PRODUCT_SET_ORDER.filter(setId => allowedSets.includes(setId));

  const toggleSet = (setId: ProductSetId) => {
    setSelectedSets(prev => {
      const isActive = prev.includes(setId);
      if (setId === "all_products") {
        if (isActive) {
          const next = prev.filter(item => item !== "all_products");
          return next.length ? sortProductSets(next) : prev;
        }
        return sortProductSets([...new Set(allowedSets)]);
      }

      let next = isActive ? prev.filter(item => item !== setId) : [...prev, setId];
      if (!next.length) return prev;

      if (next.includes("all_products")) {
        const allSelected = allowedSets.every(item => next.includes(item));
        if (!allSelected) {
          next = next.filter(item => item !== "all_products");
        }
      }

      return sortProductSets(next);
    });
  };

  const onStart = async () => {
    const baseConfig = classConfig ?? DEFAULT_CLASS_CONFIG;
    const nextSets = allowStudentOverride
      ? expandAllProducts(selectedSets.length ? selectedSets : allowedSets, allowedSets)
      : allowedSets;
    const next: PracticeConfig = {
      mode: allowStudentOverride ? mode : baseConfig.defaultMode,
      productSets: nextSets,
      speed: allowStudentOverride ? speed : "slow",
    };
    await setPracticeConfig(next);
    window.location.hash = "#/practice";
  };

  const sessionLength = classConfig?.sessionLength ?? DEFAULT_CLASS_CONFIG.sessionLength;
  const modeLabel = mode === "learn" ? t("practice.selection.modeLearn") : t("practice.selection.modeTest");
  const speedLabel = speed === "fast" ? t("practice.selection.speedFast") : t("practice.selection.speedSlow");
  const resolvedSelectedSets = expandAllProducts(selectedSets, allowedSets);
  const labelSetIds = resolvedSelectedSets.includes("all_products") ? ["all_products"] : resolvedSelectedSets;
  const selectedSetLabels = labelSetIds.map(setId => t(`practice.sets.${setId}`));

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-foreground font-sans flex flex-col">
        <Navbar
          brand={t("common.brand")}
          onBrandClick={() => {
            window.location.hash = "#/landing";
          }}
          ctaLabel={t("common.info")}
          onCtaClick={() => {
            window.location.hash = "#/landing";
          }}
          rightSlot={<LanguageToggle />}
        />
        <main className="flex-1">
          <Section>
            <Container size="narrow">
              <div className="text-sm text-muted-foreground">{t("practice.loading")}</div>
            </Container>
          </Section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-foreground font-sans flex flex-col">
      <Navbar
        brand={t("common.brand")}
        onBrandClick={() => {
          window.location.hash = "#/landing";
        }}
        ctaLabel={t("common.info")}
        onCtaClick={() => {
          window.location.hash = "#/landing";
        }}
        rightSlot={<LanguageToggle />}
      />

      <main className="flex-1">
        <Section>
          <Container size="narrow">
            <div className="grid gap-8">
              <header className="grid gap-3 text-center">
                <p className="eyebrow">{t("practice.selection.eyebrow")}</p>
                <h1 className="text-3xl font-semibold text-foreground">{t("practice.selection.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("practice.selection.subtitle")}</p>
              </header>

              <Card raised className="grid gap-6 p-6 md:p-8">
                {allowStudentOverride ? (
                  <>
                    <div className="grid gap-3">
                      <div className="text-sm text-muted-foreground">{t("practice.selection.modeLabel")}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={mode === "learn" ? "secondary" : "outline"}
                          onClick={() => setMode("learn")}
                        >
                          {t("practice.selection.modeLearn")}
                        </Button>
                        <Button
                          type="button"
                          variant={mode === "test" ? "secondary" : "outline"}
                          onClick={() => setMode("test")}
                        >
                          {t("practice.selection.modeTest")}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="text-sm text-muted-foreground">{t("practice.selection.setsLabel")}</div>
                      <div className="flex flex-wrap gap-2">
                        {orderedSets.map(setId => {
                          const selected = selectedSets.includes(setId);
                          return (
                            <Button
                              key={setId}
                              type="button"
                              variant={selected ? "secondary" : "outline"}
                              size="sm"
                              className="gap-2"
                              aria-pressed={selected}
                              onClick={() => toggleSet(setId)}
                            >
                              {t(`practice.sets.${setId}`)}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {mode === "test" ? (
                      <div className="grid gap-3">
                        <div className="text-sm text-muted-foreground">{t("practice.selection.speedLabel")}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant={speed === "slow" ? "secondary" : "outline"}
                            onClick={() => setSpeed("slow")}
                          >
                            {t("practice.selection.speedSlow")}
                          </Button>
                          <Button
                            type="button"
                            variant={speed === "fast" ? "secondary" : "outline"}
                            onClick={() => setSpeed("fast")}
                          >
                            {t("practice.selection.speedFast")}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="grid gap-3 text-sm text-muted-foreground">
                    <div className="text-sm text-muted-foreground">{t("practice.selection.lockedTitle")}</div>
                    <div className="text-base text-foreground">
                      {modeLabel} · {selectedSetLabels.join(" · ")}
                    </div>
                    {mode === "test" ? (
                      <div className="text-sm text-muted-foreground">
                        {t("practice.selection.speedLabel")}: {speedLabel}
                      </div>
                    ) : null}
                    <div className="text-xs text-muted-foreground">{t("practice.selection.lockedNote")}</div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>{t("practice.selection.sessionLength", { count: sessionLength })}</span>
                  {!isOnline ? <Badge>{t("practice.status.offline")}</Badge> : null}
                </div>

                <Button onClick={onStart} size="lg" className="w-full" disabled={selectedSets.length === 0}>
                  {t("practice.selection.start")}
                </Button>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer brand={t("common.brand")} copyrightText={copyright} />
    </div>
  );
}





