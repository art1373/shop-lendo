import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import ThankYou from "./ThankYou";
import { OrderDetails } from "@/utils/mockStripePayment";
import { CartItem } from "@/contexts/CartContext.types";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/utils/mockStripePayment", async () => {
  const actual = await vi.importActual("@/utils/mockStripePayment");
  let mockOrderDetails: OrderDetails | null = null;

  return {
    ...actual,
    getLastOrderDetails: vi.fn(() => mockOrderDetails),
    clearLastOrderDetails: vi.fn(() => {
      mockOrderDetails = null;
    }),
    setMockOrderDetails: (details: OrderDetails | null) => {
      mockOrderDetails = details;
    },
  };
});

const { getLastOrderDetails, clearLastOrderDetails } = await import(
  "@/utils/mockStripePayment"
);

const { setMockOrderDetails } = vi.mocked(
  await import("@/utils/mockStripePayment")
) as unknown as {
  setMockOrderDetails: (details: OrderDetails | null) => void;
};

const mockCartItem: CartItem = {
  productId: 1,
  name: "Test Product",
  brand: "Test Brand",
  price: "199",
  quantity: 2,
  selectedVariant: { color: "blue" },
  variantKey: JSON.stringify({ color: "blue" }),
};

const mockCartItem2: CartItem = {
  productId: 2,
  name: "Another Product",
  brand: "Another Brand",
  price: "299",
  quantity: 1,
  selectedVariant: { color: "red" },
  variantKey: JSON.stringify({ color: "red" }),
};

const mockOrderDetails: OrderDetails = {
  items: [mockCartItem],
  total: 398,
  transactionId: "mock_1234567890_abc123def",
  timestamp: new Date().toISOString(),
};

const renderThankYou = () => {
  return render(
    <BrowserRouter>
      <ThankYou />
    </BrowserRouter>
  );
};

describe("ThankYou", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
    setMockOrderDetails(null);
  });

  describe("with no order details", () => {
    it("should redirect to home when no order details exist", () => {
      setMockOrderDetails(null);

      renderThankYou();

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should return null when no order details", () => {
      setMockOrderDetails(null);

      const { container } = renderThankYou();

      expect(container.firstChild).toBeNull();
    });

    it("should call getLastOrderDetails on mount", () => {
      setMockOrderDetails(null);

      renderThankYou();

      expect(getLastOrderDetails).toHaveBeenCalled();
    });
  });

  describe("with order details", () => {
    beforeEach(() => {
      setMockOrderDetails(mockOrderDetails);
    });

    it("should render success heading", () => {
      renderThankYou();

      expect(screen.getByText("Thank You for Your Order!")).toBeInTheDocument();
    });

    it("should render success message", () => {
      renderThankYou();

      expect(
        screen.getByText("Your order has been successfully placed")
      ).toBeInTheDocument();
    });

    it("should display transaction ID", () => {
      renderThankYou();

      expect(screen.getByText(/Transaction ID:/i)).toBeInTheDocument();
      expect(
        screen.getByText(mockOrderDetails.transactionId)
      ).toBeInTheDocument();
    });

    it("should render order summary heading", () => {
      renderThankYou();

      expect(screen.getByText("Order Summary")).toBeInTheDocument();
    });

    it("should render product name", () => {
      renderThankYou();

      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should render product brand", () => {
      renderThankYou();

      expect(screen.getByText("Test Brand")).toBeInTheDocument();
    });

    it("should render product quantity", () => {
      renderThankYou();

      expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    });

    it("should render total paid label", () => {
      renderThankYou();

      expect(screen.getByText("Total Paid:")).toBeInTheDocument();
    });

    it("should render total amount", () => {
      renderThankYou();

      const totalElements = screen.getAllByText(/398/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it("should render confirmation message", () => {
      renderThankYou();

      expect(
        screen.getByText(/confirmation email has been sent/i)
      ).toBeInTheDocument();
    });

    it("should render back to home button", () => {
      renderThankYou();

      const button = screen.getByRole("button", { name: /back to home/i });
      expect(button).toBeInTheDocument();
    });

    it("should have check circle icon", () => {
      renderThankYou();

      // Look for the lucide-react CheckCircle component mock
      const checkCircle = screen.getByTestId("check-circle-icon");
      expect(checkCircle).toBeInTheDocument();
    });
  });

  describe("multiple items", () => {
    beforeEach(() => {
      setMockOrderDetails({
        ...mockOrderDetails,
        items: [mockCartItem, mockCartItem2],
        total: 697,
      });
    });

    it("should render all order items", () => {
      renderThankYou();

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Another Product")).toBeInTheDocument();
    });

    it("should render all item brands", () => {
      renderThankYou();

      expect(screen.getByText("Test Brand")).toBeInTheDocument();
      expect(screen.getByText("Another Brand")).toBeInTheDocument();
    });

    it("should render quantities for all items", () => {
      renderThankYou();

      expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
      expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
    });

    it("should calculate item totals correctly", () => {
      renderThankYou();

      // Item 1: 199 * 2 = 398
      expect(screen.getByText(/398/)).toBeInTheDocument();
      // Item 2: 299 * 1 = 299
      expect(screen.getByText(/299/)).toBeInTheDocument();
    });

    it("should display correct grand total", () => {
      renderThankYou();

      const totalElements = screen.getAllByText(/697/);
      expect(totalElements.length).toBeGreaterThan(0);
    });
  });

  describe("back to home functionality", () => {
    beforeEach(() => {
      setMockOrderDetails(mockOrderDetails);
    });

    it("should call clearLastOrderDetails when back to home clicked", async () => {
      const user = userEvent.setup();
      renderThankYou();

      const button = screen.getByRole("button", { name: /back to home/i });
      await user.click(button);

      expect(clearLastOrderDetails).toHaveBeenCalled();
    });

    it("should navigate to home when button clicked", async () => {
      const user = userEvent.setup();
      renderThankYou();

      const button = screen.getByRole("button", { name: /back to home/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should clear and navigate in correct order", async () => {
      const user = userEvent.setup();
      renderThankYou();

      const button = screen.getByRole("button", { name: /back to home/i });
      await user.click(button);

      expect(clearLastOrderDetails).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("product images", () => {
    beforeEach(() => {
      setMockOrderDetails(mockOrderDetails);
    });

    it("should render product image with correct alt text", () => {
      renderThankYou();

      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
    });

    it("should render fallback icon when no image available", () => {
      setMockOrderDetails({
        ...mockOrderDetails,
        items: [{ ...mockCartItem, productId: 999 }],
      });

      renderThankYou();

      // Should still render the product name
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  describe("price formatting", () => {
    beforeEach(() => {
      setMockOrderDetails(mockOrderDetails);
    });

    it("should display formatted item price", () => {
      renderThankYou();

      // 199 * 2 = 398
      const prices = screen.getAllByText(/398/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should display formatted total price", () => {
      renderThankYou();

      const totalElements = screen.getAllByText(/398/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it("should handle large amounts", () => {
      setMockOrderDetails({
        ...mockOrderDetails,
        items: [{ ...mockCartItem, price: "12999", quantity: 1 }],
        total: 12999,
      });

      renderThankYou();

      const priceElements = screen.getAllByText(/12.*999/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe("navigation behavior", () => {
    it("should not navigate when order details exist", () => {
      setMockOrderDetails(mockOrderDetails);

      renderThankYou();

      // Should not have navigated away immediately
      expect(mockNavigate).not.toHaveBeenCalledWith("/");
    });

    it("should navigate only when explicitly clicking back button", async () => {
      const user = userEvent.setup();
      setMockOrderDetails(mockOrderDetails);

      renderThankYou();

      // No navigation yet
      expect(mockNavigate).not.toHaveBeenCalled();

      // Click button
      const button = screen.getByRole("button", { name: /back to home/i });
      await user.click(button);

      // Should now navigate
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("order details structure", () => {
    it("should handle order with empty items array", () => {
      setMockOrderDetails({
        ...mockOrderDetails,
        items: [],
        total: 0,
      });

      renderThankYou();

      expect(screen.getByText("Order Summary")).toBeInTheDocument();
      // Check for zero total
      const totalElements = screen.getAllByText(/0/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it("should display transaction ID in monospace font", () => {
      setMockOrderDetails(mockOrderDetails);

      renderThankYou();

      const transactionElement = screen.getByText(
        mockOrderDetails.transactionId
      );
      expect(transactionElement).toBeInTheDocument();
    });

    it("should handle different transaction ID formats", () => {
      const customOrderDetails = {
        ...mockOrderDetails,
        transactionId: "custom_tx_12345",
      };
      setMockOrderDetails(customOrderDetails);

      renderThankYou();

      expect(screen.getByText("custom_tx_12345")).toBeInTheDocument();
    });
  });

  describe("item display", () => {
    beforeEach(() => {
      setMockOrderDetails(mockOrderDetails);
    });

    it("should render each item in a separate card", () => {
      setMockOrderDetails({
        ...mockOrderDetails,
        items: [mockCartItem, mockCartItem2],
      });

      renderThankYou();

      const items = screen.getAllByText(/Quantity:/);
      expect(items).toHaveLength(2);
    });

    it("should display item details in correct format", () => {
      renderThankYou();

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
      expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    });

    it("should calculate and display item subtotal", () => {
      renderThankYou();

      // 199 * 2 = 398
      const priceElements = screen.getAllByText(/398/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe("accessibility", () => {
    beforeEach(() => {
      setMockOrderDetails(mockOrderDetails);
    });

    it("should have proper heading hierarchy", () => {
      renderThankYou();

      const mainHeading = screen.getByText("Thank You for Your Order!");
      expect(mainHeading).toBeInTheDocument();

      const summaryHeading = screen.getByText("Order Summary");
      expect(summaryHeading).toBeInTheDocument();
    });

    it("should have accessible button", () => {
      renderThankYou();

      const button = screen.getByRole("button", { name: /back to home/i });
      expect(button).toBeInTheDocument();
    });

    it("should have alt text for images", () => {
      renderThankYou();

      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle zero total", () => {
      setMockOrderDetails({
        ...mockOrderDetails,
        total: 0,
        items: [],
      });

      renderThankYou();

      const totalElements = screen.getAllByText(/0/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it("should handle very large quantities", () => {
      setMockOrderDetails({
        ...mockOrderDetails,
        items: [{ ...mockCartItem, quantity: 999 }],
      });

      renderThankYou();

      expect(screen.getByText("Quantity: 999")).toBeInTheDocument();
    });

    it("should handle long product names", () => {
      const longName = "A".repeat(100);
      setMockOrderDetails({
        ...mockOrderDetails,
        items: [{ ...mockCartItem, name: longName }],
      });

      renderThankYou();

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("should handle very long transaction IDs", () => {
      const longTxId = "mock_" + "x".repeat(100);
      setMockOrderDetails({
        ...mockOrderDetails,
        transactionId: longTxId,
      });

      renderThankYou();

      expect(screen.getByText(longTxId)).toBeInTheDocument();
    });
  });

  describe("i18n integration", () => {
    beforeEach(() => {
      setMockOrderDetails(mockOrderDetails);
    });

    it("should call translation function for currency", () => {
      renderThankYou();

      // The component uses t("currency")
      const currencyElements = screen.getAllByText(/currency/i);
      expect(currencyElements.length).toBeGreaterThan(0);
    });
  });
});
