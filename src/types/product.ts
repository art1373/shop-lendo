export interface ProductOption {
  color?: string | string[];
  power?: number[];
  storage?: string[];
  quantity: number;
  [key: string]: string | string[] | number[] | number | undefined;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  available: boolean;
  weight: number;
  options: ProductOption[];
}

export interface Inventory {
  items: Product[];
}
