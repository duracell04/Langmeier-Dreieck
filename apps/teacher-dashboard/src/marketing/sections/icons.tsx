import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function LayersIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="5" width="12" height="7" rx="1.5" />
      <rect x="8" y="12" width="12" height="7" rx="1.5" />
    </svg>
  );
}

export function TriangleIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 5 L20 19 H4 Z" />
    </svg>
  );
}

export function ArrowsIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 12H20" />
      <path d="M7 9L4 12L7 15" />
      <path d="M17 9L20 12L17 15" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 5V19" />
      <path d="M5 12H19" />
    </svg>
  );
}

export function QrIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14H20V20H14Z" />
      <path d="M16 16H18V18H16Z" />
    </svg>
  );
}

export function BarChartIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 19V12" />
      <path d="M12 19V8" />
      <path d="M19 19V5" />
      <path d="M4 19H20" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 12L10 17L19 8" />
    </svg>
  );
}
