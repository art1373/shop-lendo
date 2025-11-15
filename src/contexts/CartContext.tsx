import React, { createContext, useContext, useState, useEffect } from "react";
import { CartContextType, CartItem } from "./CartContext.types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) =>
          i.productId === item.productId && i.variantKey === item.variantKey
      );

      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === item.productId && i.variantKey === item.variantKey
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }

      return [...prevItems, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeItem = (productId: number, variantKey: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (i) => !(i.productId === productId && i.variantKey === variantKey)
      )
    );
  };

  const updateQuantity = (
    productId: number,
    variantKey: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, variantKey);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((i) =>
        i.productId === productId && i.variantKey === variantKey
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
