import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart, CartItem } from "./CartContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("useCart hook", () => {
    it("should throw error when used outside CartProvider", () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useCart());
      }).toThrow("useCart must be used within CartProvider");

      console.error = consoleError;
    });

    it("should provide cart context when used within CartProvider", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
      expect(typeof result.current.addItem).toBe("function");
      expect(typeof result.current.removeItem).toBe("function");
      expect(typeof result.current.updateQuantity).toBe("function");
      expect(typeof result.current.clearCart).toBe("function");
    });
  });

  describe("Initial state", () => {
    it("should initialize with empty cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
    });

    it("should load cart from localStorage if available", () => {
      const savedCart: CartItem[] = [
        {
          productId: 1,
          name: "Test Product",
          brand: "Test Brand",
          price: "100",
          quantity: 2,
          selectedVariant: { color: "red" },
          variantKey: JSON.stringify({ color: "red" }),
        },
      ];
      localStorage.setItem("cart", JSON.stringify(savedCart));

      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.items).toEqual(savedCart);
      expect(result.current.totalItems).toBe(2);
    });
  });

  describe("addItem", () => {
    it("should add new item to cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const newItem = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      act(() => {
        result.current.addItem(newItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual({ ...newItem, quantity: 1 });
      expect(result.current.totalItems).toBe(1);
    });

    it("should add item with specified quantity", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const newItem = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
        quantity: 3,
      };

      act(() => {
        result.current.addItem(newItem);
      });

      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.totalItems).toBe(3);
    });

    it("should increment quantity if item with same productId and variantKey exists", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      act(() => {
        result.current.addItem(item);
        result.current.addItem(item);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.totalItems).toBe(2);
    });

    it("should add separate items for different variants of same product", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item1 = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      const item2 = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "red" },
        variantKey: JSON.stringify({ color: "red" }),
      };

      act(() => {
        result.current.addItem(item1);
        result.current.addItem(item2);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.totalItems).toBe(2);
    });

    it("should persist cart to localStorage", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      act(() => {
        result.current.addItem(item);
      });

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart).toHaveLength(1);
      expect(savedCart[0].productId).toBe(1);
    });
  });

  describe("removeItem", () => {
    it("should remove item from cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      act(() => {
        result.current.addItem(item);
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.removeItem(1, JSON.stringify({ color: "blue" }));
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
    });

    it("should only remove item matching both productId and variantKey", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item1 = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      const item2 = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "red" },
        variantKey: JSON.stringify({ color: "red" }),
      };

      act(() => {
        result.current.addItem(item1);
        result.current.addItem(item2);
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.removeItem(1, JSON.stringify({ color: "blue" }));
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].selectedVariant.color).toBe("red");
    });

    it("should update localStorage when removing item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      act(() => {
        result.current.addItem(item);
        result.current.removeItem(1, JSON.stringify({ color: "blue" }));
      });

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart).toHaveLength(0);
    });
  });

  describe("updateQuantity", () => {
    it("should update item quantity", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      act(() => {
        result.current.addItem(item);
        result.current.updateQuantity(1, JSON.stringify({ color: "blue" }), 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
    });

    it("should remove item when quantity is set to 0", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      act(() => {
        result.current.addItem(item);
        result.current.updateQuantity(1, JSON.stringify({ color: "blue" }), 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("should remove item when quantity is negative", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      act(() => {
        result.current.addItem(item);
        result.current.updateQuantity(1, JSON.stringify({ color: "blue" }), -1);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("should only update quantity for matching productId and variantKey", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const item1 = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };

      const item2 = {
        productId: 1,
        name: "Product 1",
        brand: "Brand 1",
        price: "100",
        selectedVariant: { color: "red" },
        variantKey: JSON.stringify({ color: "red" }),
      };

      act(() => {
        result.current.addItem(item1);
        result.current.addItem(item2);
        result.current.updateQuantity(1, JSON.stringify({ color: "blue" }), 10);
      });

      const blueItem = result.current.items.find(
        (i) => i.variantKey === JSON.stringify({ color: "blue" })
      );
      const redItem = result.current.items.find(
        (i) => i.variantKey === JSON.stringify({ color: "red" })
      );

      expect(blueItem?.quantity).toBe(10);
      expect(redItem?.quantity).toBe(1);
    });
  });

  describe("clearCart", () => {
    it("should remove all items from cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: "Product 1",
          brand: "Brand 1",
          price: "100",
          selectedVariant: { color: "blue" },
          variantKey: JSON.stringify({ color: "blue" }),
        });
        result.current.addItem({
          productId: 2,
          name: "Product 2",
          brand: "Brand 2",
          price: "200",
          selectedVariant: { color: "red" },
          variantKey: JSON.stringify({ color: "red" }),
        });
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
    });

    it("should clear localStorage", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: "Product 1",
          brand: "Brand 1",
          price: "100",
          selectedVariant: { color: "blue" },
          variantKey: JSON.stringify({ color: "blue" }),
        });
        result.current.clearCart();
      });

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart).toHaveLength(0);
    });
  });

  describe("totalItems", () => {
    it("should calculate total items correctly", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: "Product 1",
          brand: "Brand 1",
          price: "100",
          selectedVariant: { color: "blue" },
          variantKey: JSON.stringify({ color: "blue" }),
          quantity: 3,
        });
        result.current.addItem({
          productId: 2,
          name: "Product 2",
          brand: "Brand 2",
          price: "200",
          selectedVariant: { color: "red" },
          variantKey: JSON.stringify({ color: "red" }),
          quantity: 2,
        });
      });

      expect(result.current.totalItems).toBe(5);
    });

    it("should return 0 for empty cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.totalItems).toBe(0);
    });
  });
});
