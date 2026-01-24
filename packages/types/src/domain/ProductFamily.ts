// packages/types/src/domain/ProductFamily.ts
export type SetId = "core" | "squares" | "division" | "tricky";

export interface ProductFamily {
  id: string;                       // UUID
  product: number;                  // e.g. 24
  factorPairs: Array<[number, number]>; // normalized a<=b recommended
  tags?: string[];                  // e.g. ["core","tricky"]
  canonicalPair?: [number, number]; // UI hint only
}
