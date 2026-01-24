import React from "react";

type Key = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "clear" | "back" | "enter";

export interface KeypadProps {
  onKey: (key: Key) => void;
}

export function Keypad({ onKey }: KeypadProps) {
  const keys: Key[] = [
    "7", "8", "9",
    "4", "5", "6",
    "1", "2", "3",
    "clear", "0", "back",
  ];

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 70px)", gap: 10 }}>
        {keys.map(k => (
          <button
            key={k}
            type="button"
            onClick={() => onKey(k)}
            style={{ padding: "14px 0", fontSize: 18, borderRadius: 10 }}
          >
            {k === "clear" ? "CLR" : k === "back" ? "DEL" : k}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onKey("enter")}
        style={{ padding: "12px 0", fontSize: 18, borderRadius: 10 }}
      >
        ENTER
      </button>
    </div>
  );
}
