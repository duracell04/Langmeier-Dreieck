import React from "react";

type Slot = "product" | "left" | "right";

export interface TriangleProps {
  product: string;
  left: string;
  right: string;
  missing: Slot;
  lockedSlots?: Slot[];
}

export function Triangle({ product, left, right, missing, lockedSlots = [] }: TriangleProps) {
  const slotStyle = (slot: Slot) => ({
    border: slot === missing ? "2px dashed #333" : "2px solid #333",
    background: slot === missing ? "#fff7e6" : "#f6f6f6",
    padding: "10px 14px",
    minWidth: 70,
    textAlign: "center" as const,
    borderRadius: 8,
    position: "relative" as const,
  });

  const lockStyle = {
    position: "absolute" as const,
    top: -8,
    right: -8,
    background: "#333",
    color: "#fff",
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 10,
  };

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
      <div style={slotStyle("product")}>{product}{lockedSlots.includes("product") ? <span style={lockStyle}>LOCK</span> : null}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={slotStyle("left")}>{left}{lockedSlots.includes("left") ? <span style={lockStyle}>LOCK</span> : null}</div>
        <div style={slotStyle("right")}>{right}{lockedSlots.includes("right") ? <span style={lockStyle}>LOCK</span> : null}</div>
      </div>
    </div>
  );
}
