import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Checkout from "./Checkout";
import { CartProvider } from "@/contexts/CartContext";
import { CartItem } from "@/contexts/CartContext";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderCheckout = (cartItems: CartItem[] = []) => {
  if (cartItems.length > 0) {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }

  return render(
    <BrowserRouter>
      <CartProvider>
        <Checkout />
      </CartProvider>
    </BrowserRouter>
  );
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
  selectedVariant: { color: "red", size: "large" },
  variantKey: JSON.stringify({ color: "red", size: "large" }),
};

describe("Checkout", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  describe("empty cart", () => {
    it("should render empty cart message", () => {
      renderCheckout([]);
      expect(screen.getByText("cartEmpty")).toBeInTheDocument();
    });

    it("should render empty cart description", () => {
      renderCheckout([]);
      expect(screen.getByText("cartEmptyDesc")).toBeInTheDocument();
    });

    it("should render browse products button", () => {
      renderCheckout([]);
      const button = screen.getByRole("button", { name: /browseProductsBtn/i });
      expect(button).toBeInTheDocument();
    });

    it("should navigate to home when browse products clicked", async () => {
      const user = userEvent.setup();
      renderCheckout([]);

      const button = screen.getByRole("button", { name: /browseProductsBtn/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should show shopping bag icon", () => {
      renderCheckout([]);
      expect(screen.getByTestId("shopping-bag-icon")).toBeInTheDocument();
    });
  });

  describe("cart with items", () => {
    it("should render page heading", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText("shoppingCart")).toBeInTheDocument();
    });

    it("should render cart item name", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should render cart item brand", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
    });

    it("should render item quantity", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should render item price", () => {
      renderCheckout([mockCartItem]);
      const prices = screen.getAllByText(/398/);
      expect(prices.length).toBeGreaterThan(0); // 199 * 2
    });

    it("should render order summary", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText("orderSummary")).toBeInTheDocument();
    });

    it("should render subtotal", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText("subtotal")).toBeInTheDocument();
    });

    it("should render shipping info", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText("shipping")).toBeInTheDocument();
      expect(screen.getByText("calculatedAtCheckout")).toBeInTheDocument();
    });

    it("should render total", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText("total")).toBeInTheDocument();
    });

    it("should render proceed to checkout button", () => {
      renderCheckout([mockCartItem]);
      const button = screen.getByRole("button", { name: /proceedToCheckout/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("item variants display", () => {
    it("should display variant information", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByText(/color: blue/i)).toBeInTheDocument();
    });

    it("should display multiple variant attributes", () => {
      renderCheckout([mockCartItem2]);
      const variantText = screen.getByText(/color: red/i);
      expect(variantText).toBeInTheDocument();
      expect(screen.getByText(/size: large/i)).toBeInTheDocument();
    });

    it("should handle array values in variants", () => {
      const itemWithArray: CartItem = {
        ...mockCartItem,
        selectedVariant: { storage: ["32GB", "64GB"] },
        variantKey: JSON.stringify({ storage: ["32GB", "64GB"] }),
      };
      renderCheckout([itemWithArray]);
      expect(screen.getByText(/storage: 32GB, 64GB/i)).toBeInTheDocument();
    });
  });

  describe("quantity controls", () => {
    it("should render increase quantity button", () => {
      renderCheckout([mockCartItem]);
      const plusButtons = screen.getAllByTestId("plus-icon");
      expect(plusButtons.length).toBeGreaterThan(0);
    });

    it("should render decrease quantity button", () => {
      renderCheckout([mockCartItem]);
      const minusButtons = screen.getAllByTestId("minus-icon");
      expect(minusButtons.length).toBeGreaterThan(0);
    });

    it("should increase quantity when plus clicked", async () => {
      const user = userEvent.setup();
      renderCheckout([mockCartItem]);

      const plusButtons = screen.getAllByTestId("plus-icon");
      await user.click(plusButtons[0]);

      // Quantity should increase to 3
      expect(screen.getByText("3")).toBeInTheDocument();

      // Price should update (199 * 3 = 597)
      const prices = screen.getAllByText(/597/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should decrease quantity when minus clicked", async () => {
      const user = userEvent.setup();
      renderCheckout([{ ...mockCartItem, quantity: 3 }]);

      const minusButtons = screen.getAllByTestId("minus-icon");
      await user.click(minusButtons[0]);

      // Quantity should decrease to 2
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should remove item when quantity decreased to 0", async () => {
      const user = userEvent.setup();
      renderCheckout([{ ...mockCartItem, quantity: 1 }]);

      const minusButtons = screen.getAllByTestId("minus-icon");
      await user.click(minusButtons[0]);

      // Should show empty cart
      expect(screen.getByText("cartEmpty")).toBeInTheDocument();
    });

    it("should update localStorage when quantity changes", async () => {
      const user = userEvent.setup();
      renderCheckout([mockCartItem]);

      const plusButtons = screen.getAllByTestId("plus-icon");
      await user.click(plusButtons[0]);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart[0].quantity).toBe(3);
    });
  });

  describe("remove item", () => {
    it("should render remove button", () => {
      renderCheckout([mockCartItem]);
      const removeButton = screen.getByRole("button", { name: /remove/i });
      expect(removeButton).toBeInTheDocument();
    });

    it("should show trash icon", () => {
      renderCheckout([mockCartItem]);
      expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    });

    it("should remove item when remove clicked", async () => {
      const user = userEvent.setup();
      renderCheckout([mockCartItem]);

      const removeButton = screen.getByRole("button", { name: /remove/i });
      await user.click(removeButton);

      // Should show empty cart
      expect(screen.getByText("cartEmpty")).toBeInTheDocument();
    });

    it("should remove only specific item from multiple items", async () => {
      const user = userEvent.setup();
      renderCheckout([mockCartItem, mockCartItem2]);

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Another Product")).toBeInTheDocument();

      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      await user.click(removeButtons[0]);

      // First item should be removed
      expect(screen.queryByText("Test Product")).not.toBeInTheDocument();
      // Second item should still be there
      expect(screen.getByText("Another Product")).toBeInTheDocument();
    });

    it("should update localStorage when item removed", async () => {
      const user = userEvent.setup();
      renderCheckout([mockCartItem]);

      const removeButton = screen.getByRole("button", { name: /remove/i });
      await user.click(removeButton);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart).toHaveLength(0);
    });
  });

  describe("price calculations", () => {
    it("should calculate subtotal correctly for single item", () => {
      renderCheckout([mockCartItem]);
      // 199 * 2 = 398
      const prices = screen.getAllByText(/398/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should calculate subtotal correctly for multiple items", () => {
      renderCheckout([mockCartItem, mockCartItem2]);
      // (199 * 2) + (299 * 1) = 398 + 299 = 697
      const prices = screen.getAllByText(/697/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should update subtotal when quantity changes", async () => {
      const user = userEvent.setup();
      renderCheckout([mockCartItem]);

      const plusButtons = screen.getAllByTestId("plus-icon");
      await user.click(plusButtons[0]);

      // 199 * 3 = 597
      const prices = screen.getAllByText(/597/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should display item total price", () => {
      renderCheckout([mockCartItem]);
      // Each item card should show its total (199 * 2 = 398)
      const prices = screen.getAllByText(/398/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should display formatted prices", () => {
      const expensiveItem: CartItem = {
        ...mockCartItem,
        price: "12999",
        quantity: 1,
      };
      renderCheckout([expensiveItem]);

      // Should format large numbers with Swedish locale
      const prices = screen.getAllByText(/12.*999/);
      expect(prices.length).toBeGreaterThan(0);
    });
  });

  describe("multiple items", () => {
    it("should render all items in cart", () => {
      renderCheckout([mockCartItem, mockCartItem2]);

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Another Product")).toBeInTheDocument();
    });

    it("should display correct quantity for each item", () => {
      renderCheckout([mockCartItem, mockCartItem2]);

      expect(screen.getByText("2")).toBeInTheDocument(); // first item
      expect(screen.getByText("1")).toBeInTheDocument(); // second item
    });

    it("should have separate controls for each item", async () => {
      const user = userEvent.setup();
      renderCheckout([mockCartItem, mockCartItem2]);

      const plusButtons = screen.getAllByTestId("plus-icon");
      expect(plusButtons.length).toBe(2);

      const minusButtons = screen.getAllByTestId("minus-icon");
      expect(minusButtons.length).toBe(2);

      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      expect(removeButtons.length).toBe(2);
    });
  });

  describe("product images", () => {
    it("should render product image when available", () => {
      renderCheckout([mockCartItem]);
      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
    });

    it("should show fallback condition when image not available", () => {
      renderCheckout([{ ...mockCartItem, productId: 999 }]);
      // Product should still render even with unknown ID
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("should have main cart items section", () => {
      renderCheckout([mockCartItem]);
      expect(
        screen
          .getByText("Test Product")
          .closest('.lg\\:col-span-2, [class*="col-span"]')
      ).toBeInTheDocument();
    });

    it("should have order summary sidebar", () => {
      renderCheckout([mockCartItem]);
      expect(
        screen
          .getByText("orderSummary")
          .closest('.lg\\:col-span-1, [class*="col-span"]')
      ).toBeInTheDocument();
    });

    it("should use grid layout", () => {
      renderCheckout([mockCartItem]);
      const grid = screen
        .getByText("Test Product")
        .closest('.grid, [class*="grid"]')?.parentElement?.parentElement;
      expect(grid).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper heading", () => {
      renderCheckout([mockCartItem]);
      const heading = screen.getByText("shoppingCart");
      expect(heading.tagName).toBe("H1");
    });

    it("should have accessible buttons", () => {
      renderCheckout([mockCartItem]);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have alt text for images", () => {
      renderCheckout([mockCartItem]);
      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
    });

    it("should have accessible quantity controls", () => {
      renderCheckout([mockCartItem]);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe("persistence", () => {
    it("should load cart from localStorage on mount", () => {
      localStorage.setItem("cart", JSON.stringify([mockCartItem]));

      renderCheckout();

      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should persist changes to localStorage", async () => {
      const user = userEvent.setup();
      renderCheckout([mockCartItem]);

      const plusButtons = screen.getAllByTestId("plus-icon");
      await user.click(plusButtons[0]);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart[0].quantity).toBe(3);
    });
  });

  describe("order summary", () => {
    it("should display all summary sections", () => {
      renderCheckout([mockCartItem]);

      expect(screen.getByText("orderSummary")).toBeInTheDocument();
      expect(screen.getByText("subtotal")).toBeInTheDocument();
      expect(screen.getByText("shipping")).toBeInTheDocument();
      expect(screen.getByText("total")).toBeInTheDocument();
    });

    it("should show subtotal amount", () => {
      renderCheckout([mockCartItem]);
      // Should show 398 (199 * 2)
      const prices = screen.getAllByText(/398/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should show total amount", () => {
      renderCheckout([mockCartItem]);
      const prices = screen.getAllByText(/398/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should have sticky positioning", () => {
      renderCheckout([mockCartItem]);
      const summary = screen
        .getByText("orderSummary")
        .closest('.sticky, [class*="sticky"]');
      expect(summary).toBeInTheDocument();
    });
  });

  describe("variant key handling", () => {
    it("should handle items with same product ID but different variants", () => {
      const item1 = {
        ...mockCartItem,
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };
      const item2 = {
        ...mockCartItem,
        selectedVariant: { color: "red" },
        variantKey: JSON.stringify({ color: "red" }),
      };

      renderCheckout([item1, item2]);

      expect(screen.getByText(/color: blue/i)).toBeInTheDocument();
      expect(screen.getByText(/color: red/i)).toBeInTheDocument();
    });

    it("should remove correct variant when remove clicked", async () => {
      const user = userEvent.setup();
      const item1 = {
        ...mockCartItem,
        selectedVariant: { color: "blue" },
        variantKey: JSON.stringify({ color: "blue" }),
      };
      const item2 = {
        ...mockCartItem,
        selectedVariant: { color: "red" },
        variantKey: JSON.stringify({ color: "red" }),
      };

      renderCheckout([item1, item2]);

      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      await user.click(removeButtons[0]);

      // First variant should be removed
      expect(screen.queryByText(/color: blue/i)).not.toBeInTheDocument();
      // Second variant should remain
      expect(screen.getByText(/color: red/i)).toBeInTheDocument();
    });
  });
});
