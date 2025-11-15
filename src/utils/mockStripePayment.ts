import { CartItem } from "@/contexts/CartContext.types";

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface OrderDetails {
  items: CartItem[];
  total: number;
  transactionId: string;
  timestamp: string;
}

/**
 * Mock Stripe payment function that simulates a payment process
 * In a real application, this would integrate with Stripe's API
 */
export const processMockPayment = async (): Promise<PaymentResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock payment logic - 95% success rate for realism
  const shouldSucceed = Math.random() > 0.05;

  if (shouldSucceed) {
    // Generate a mock transaction ID
    const transactionId = `mock_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    return {
      success: true,
      transactionId,
    };
  } else {
    return {
      success: false,
      error: "Payment declined. Please try again.",
    };
  }
};

/**
 * Save order details to localStorage for the thank you page
 */
export const saveOrderDetails = (orderDetails: OrderDetails): void => {
  localStorage.setItem("lastOrder", JSON.stringify(orderDetails));
};

/**
 * Retrieve saved order details
 */
export const getLastOrderDetails = (): OrderDetails | null => {
  const saved = localStorage.getItem("lastOrder");
  return saved ? JSON.parse(saved) : null;
};

/**
 * Clear saved order details
 */
export const clearLastOrderDetails = (): void => {
  localStorage.removeItem("lastOrder");
};
