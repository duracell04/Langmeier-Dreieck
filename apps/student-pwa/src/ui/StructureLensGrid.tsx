import React from "react";

export interface StructureLensGridProps {
  visible: boolean;
}

export function StructureLensGrid({ visible }: StructureLensGridProps) {
  if (!visible) return null;

  const cells = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div
      aria-label="structure-lens"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        gap: 2,
        border: "1px solid #ddd",
        padding: 6,
        borderRadius: 8,
        background: "#fff",
        maxWidth: 320,
      }}
    >
      {cells.map(n => (
        <div
          key={n}
          style={{
            height: 22,
            background: "#f3f3f3",
            display: "grid",
            placeItems: "center",
            fontSize: 10,
          }}
        >
          {n}
        </div>
      ))}
    </div>
  );
}
