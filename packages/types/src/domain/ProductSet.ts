// packages/types/src/domain/ProductSet.ts
export type ProductSetId =
  | "products_3_4"
  | "products_2"
  | "squares"
  | "cardinals"
  | "all_products";

export interface ProductSetDefinition {
  id: ProductSetId;
  label: string;
  products: number[];
}

export interface CurriculumPack {
  id: string;
  locale: string;
  version: number;
  productSets: ProductSetDefinition[];
}
