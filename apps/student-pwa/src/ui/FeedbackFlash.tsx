import React from "react";

type FeedbackTone = "neutral" | "warning" | "success";

export interface FeedbackFlashProps {
  message: string;
  tone?: FeedbackTone;
}

export function FeedbackFlash({ message, tone = "neutral" }: FeedbackFlashProps) {
  const colors: Record<FeedbackTone, { bg: string; fg: string }> = {
    neutral: { bg: "#eef2ff", fg: "#1e293b" },
    warning: { bg: "#fff4e5", fg: "#92400e" },
    success: { bg: "#ecfdf3", fg: "#166534" },
  };

  const c = colors[tone];

  return (
    <div
      role="status"
      style={{
        background: c.bg,
        color: c.fg,
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}
