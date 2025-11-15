import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  processMockPayment,
  saveOrderDetails,
  getLastOrderDetails,
  clearLastOrderDetails,
  type OrderDetails,
  type PaymentResult,
} from "./mockStripePayment";
import { CartItem } from "@/contexts/CartContext.types";

describe("mockStripePayment", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("processMockPayment", () => {
    it("should return a payment result", async () => {
      const result = await processMockPayment();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("should return a transaction ID on success", async () => {
      // Mock Math.random to ensure success (> 0.05)
      vi.spyOn(Math, "random").mockReturnValue(0.1);

      const result = await processMockPayment();

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(typeof result.transactionId).toBe("string");
      expect(result.transactionId).toMatch(/^mock_\d+_[a-z0-9]+$/);
      expect(result.error).toBeUndefined();
    });

    it("should return an error message on failure", async () => {
      // Mock Math.random to ensure failure (<= 0.05)
      vi.spyOn(Math, "random").mockReturnValue(0.01);

      const result = await processMockPayment();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toBe("Payment declined. Please try again.");
      expect(result.transactionId).toBeUndefined();
    });

    it("should simulate network delay", async () => {
      const startTime = Date.now();
      await processMockPayment();
      const endTime = Date.now();

      // Should take at least 1500ms
      expect(endTime - startTime).toBeGreaterThanOrEqual(1400); // Allow small margin
    });

    it("should generate unique transaction IDs", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      const result1 = await processMockPayment();
      const result2 = await processMockPayment();

      expect(result1.transactionId).toBeDefined();
      expect(result2.transactionId).toBeDefined();
      expect(result1.transactionId).not.toBe(result2.transactionId);
    });

    it("should have approximately 95% success rate", async () => {
      // Test with boundary values
      vi.spyOn(Math, "random").mockReturnValue(0.051);
      const successResult = await processMockPayment();
      expect(successResult.success).toBe(true);

      vi.spyOn(Math, "random").mockReturnValue(0.05);
      const failResult = await processMockPayment();
      expect(failResult.success).toBe(false);
    });
  });

  describe("saveOrderDetails", () => {
    const mockCartItem: CartItem = {
      productId: 1,
      name: "Test Product",
      brand: "Test Brand",
      price: "199",
      quantity: 2,
      selectedVariant: { color: "blue" },
      variantKey: JSON.stringify({ color: "blue" }),
    };

    const mockOrderDetails: OrderDetails = {
      items: [mockCartItem],
      total: 398,
      transactionId: "mock_123456_abc",
      timestamp: new Date().toISOString(),
    };

    it("should save order details to localStorage", () => {
      saveOrderDetails(mockOrderDetails);

      const saved = localStorage.getItem("lastOrder");
      expect(saved).toBeDefined();
      expect(saved).not.toBeNull();
    });

    it("should save order details as JSON string", () => {
      saveOrderDetails(mockOrderDetails);

      const saved = localStorage.getItem("lastOrder");
      expect(() => JSON.parse(saved!)).not.toThrow();
    });

    it("should save all order details fields", () => {
      saveOrderDetails(mockOrderDetails);

      const saved = JSON.parse(localStorage.getItem("lastOrder")!);
      expect(saved.items).toEqual(mockOrderDetails.items);
      expect(saved.total).toBe(mockOrderDetails.total);
      expect(saved.transactionId).toBe(mockOrderDetails.transactionId);
      expect(saved.timestamp).toBe(mockOrderDetails.timestamp);
    });

    it("should overwrite previous order details", () => {
      const firstOrder: OrderDetails = {
        ...mockOrderDetails,
        transactionId: "first_order",
      };
      const secondOrder: OrderDetails = {
        ...mockOrderDetails,
        transactionId: "second_order",
      };

      saveOrderDetails(firstOrder);
      saveOrderDetails(secondOrder);

      const saved = JSON.parse(localStorage.getItem("lastOrder")!);
      expect(saved.transactionId).toBe("second_order");
    });

    it("should handle multiple items", () => {
      const multipleItemsOrder: OrderDetails = {
        items: [
          mockCartItem,
          {
            ...mockCartItem,
            productId: 2,
            name: "Another Product",
          },
        ],
        total: 796,
        transactionId: "mock_multi",
        timestamp: new Date().toISOString(),
      };

      saveOrderDetails(multipleItemsOrder);

      const saved = JSON.parse(localStorage.getItem("lastOrder")!);
      expect(saved.items).toHaveLength(2);
      expect(saved.items[0].productId).toBe(1);
      expect(saved.items[1].productId).toBe(2);
    });

    it("should handle empty cart items array", () => {
      const emptyOrder: OrderDetails = {
        items: [],
        total: 0,
        transactionId: "mock_empty",
        timestamp: new Date().toISOString(),
      };

      saveOrderDetails(emptyOrder);

      const saved = JSON.parse(localStorage.getItem("lastOrder")!);
      expect(saved.items).toEqual([]);
      expect(saved.total).toBe(0);
    });
  });

  describe("getLastOrderDetails", () => {
    const mockCartItem: CartItem = {
      productId: 1,
      name: "Test Product",
      brand: "Test Brand",
      price: "199",
      quantity: 2,
      selectedVariant: { color: "blue" },
      variantKey: JSON.stringify({ color: "blue" }),
    };

    const mockOrderDetails: OrderDetails = {
      items: [mockCartItem],
      total: 398,
      transactionId: "mock_123456_abc",
      timestamp: new Date().toISOString(),
    };

    it("should return null when no order details exist", () => {
      const result = getLastOrderDetails();
      expect(result).toBeNull();
    });

    it("should return saved order details", () => {
      saveOrderDetails(mockOrderDetails);

      const result = getLastOrderDetails();
      expect(result).not.toBeNull();
      expect(result).toEqual(mockOrderDetails);
    });

    it("should return correct order details structure", () => {
      saveOrderDetails(mockOrderDetails);

      const result = getLastOrderDetails();
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("transactionId");
      expect(result).toHaveProperty("timestamp");
    });

    it("should return all cart items", () => {
      saveOrderDetails(mockOrderDetails);

      const result = getLastOrderDetails();
      expect(result!.items).toHaveLength(1);
      expect(result!.items[0]).toEqual(mockCartItem);
    });

    it("should handle malformed JSON gracefully", () => {
      localStorage.setItem("lastOrder", "invalid json {{{");

      expect(() => getLastOrderDetails()).toThrow();
    });

    it("should return most recent order details", () => {
      const firstOrder: OrderDetails = {
        ...mockOrderDetails,
        transactionId: "first_order",
      };
      const secondOrder: OrderDetails = {
        ...mockOrderDetails,
        transactionId: "second_order",
      };

      saveOrderDetails(firstOrder);
      saveOrderDetails(secondOrder);

      const result = getLastOrderDetails();
      expect(result!.transactionId).toBe("second_order");
    });

    it("should preserve data types", () => {
      saveOrderDetails(mockOrderDetails);

      const result = getLastOrderDetails();
      expect(typeof result!.total).toBe("number");
      expect(typeof result!.transactionId).toBe("string");
      expect(typeof result!.timestamp).toBe("string");
      expect(Array.isArray(result!.items)).toBe(true);
    });
  });

  describe("clearLastOrderDetails", () => {
    const mockOrderDetails: OrderDetails = {
      items: [
        {
          productId: 1,
          name: "Test Product",
          brand: "Test Brand",
          price: "199",
          quantity: 2,
          selectedVariant: { color: "blue" },
          variantKey: JSON.stringify({ color: "blue" }),
        },
      ],
      total: 398,
      transactionId: "mock_123456_abc",
      timestamp: new Date().toISOString(),
    };

    it("should remove order details from localStorage", () => {
      saveOrderDetails(mockOrderDetails);
      expect(localStorage.getItem("lastOrder")).not.toBeNull();

      clearLastOrderDetails();
      expect(localStorage.getItem("lastOrder")).toBeNull();
    });

    it("should not throw error when no order details exist", () => {
      expect(() => clearLastOrderDetails()).not.toThrow();
    });

    it("should allow saving new order after clearing", () => {
      saveOrderDetails(mockOrderDetails);
      clearLastOrderDetails();

      const newOrder: OrderDetails = {
        ...mockOrderDetails,
        transactionId: "new_order",
      };
      saveOrderDetails(newOrder);

      const result = getLastOrderDetails();
      expect(result!.transactionId).toBe("new_order");
    });

    it("should make getLastOrderDetails return null after clearing", () => {
      saveOrderDetails(mockOrderDetails);
      clearLastOrderDetails();

      const result = getLastOrderDetails();
      expect(result).toBeNull();
    });
  });

  describe("integration", () => {
    const mockCartItem: CartItem = {
      productId: 1,
      name: "Test Product",
      brand: "Test Brand",
      price: "199",
      quantity: 2,
      selectedVariant: { color: "blue" },
      variantKey: JSON.stringify({ color: "blue" }),
    };

    it("should handle complete payment flow", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      // Process payment
      const paymentResult = await processMockPayment();
      expect(paymentResult.success).toBe(true);

      // Save order
      const orderDetails: OrderDetails = {
        items: [mockCartItem],
        total: 398,
        transactionId: paymentResult.transactionId!,
        timestamp: new Date().toISOString(),
      };
      saveOrderDetails(orderDetails);

      // Retrieve order
      const savedOrder = getLastOrderDetails();
      expect(savedOrder).not.toBeNull();
      expect(savedOrder!.transactionId).toBe(paymentResult.transactionId);

      // Clear order
      clearLastOrderDetails();
      expect(getLastOrderDetails()).toBeNull();
    });

    it("should not save order details on payment failure", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.01);

      const paymentResult = await processMockPayment();
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.transactionId).toBeUndefined();

      // Should not have saved anything
      const savedOrder = getLastOrderDetails();
      expect(savedOrder).toBeNull();
    });
  });

  describe("TypeScript types", () => {
    it("PaymentResult should have correct shape for success", () => {
      const successResult: PaymentResult = {
        success: true,
        transactionId: "mock_123",
      };

      expect(successResult.success).toBe(true);
      expect(successResult.transactionId).toBeDefined();
    });

    it("PaymentResult should have correct shape for failure", () => {
      const failureResult: PaymentResult = {
        success: false,
        error: "Payment declined. Please try again.",
      };

      expect(failureResult.success).toBe(false);
      expect(failureResult.error).toBeDefined();
    });

    it("OrderDetails should have correct shape", () => {
      const orderDetails: OrderDetails = {
        items: [],
        total: 0,
        transactionId: "mock_123",
        timestamp: new Date().toISOString(),
      };

      expect(orderDetails.items).toBeDefined();
      expect(orderDetails.total).toBeDefined();
      expect(orderDetails.transactionId).toBeDefined();
      expect(orderDetails.timestamp).toBeDefined();
    });
  });
});
