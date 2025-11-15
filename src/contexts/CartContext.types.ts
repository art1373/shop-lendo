export interface CartItem {
  productId: number;
  name: string;
  brand: string;
  price: string;
  quantity: number;
  selectedVariant: Record<string, string | string[]>;
  variantKey: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: number, variantKey: string) => void;
  updateQuantity: (
    productId: number,
    variantKey: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
}
