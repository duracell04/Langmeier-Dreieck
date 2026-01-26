import * as React from "react";
import { cn } from "../utils/cn";

export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T extends Record<string, React.ReactNode>> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  rowKey?: (row: T, index: number) => string | number;
  className?: string;
}

export function DataTable<T extends Record<string, React.ReactNode>>({
  columns,
  rows,
  rowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead className="text-micro uppercase tracking-wide text-muted">
          <tr className="border-b border-grid-border">
            {columns.map(column => (
              <th key={String(column.key)} className={cn("px-3 py-2 font-semibold", alignClass(column.align))}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-ink">
          {rows.map((row, index) => (
            <tr key={rowKey ? rowKey(row, index) : index} className="border-b border-grid-border">
              {columns.map(column => (
                <td key={String(column.key)} className={cn("px-3 py-3", alignClass(column.align))}>
                  {row[column.key] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function alignClass(align?: "left" | "center" | "right") {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}
