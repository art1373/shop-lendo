import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { CartProvider } from "@/contexts/CartContext";
import { Product } from "@/types/product";

// Mock toast hook
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

const renderProductCard = (product: Product) => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <ProductCard product={product} />
      </CartProvider>
    </BrowserRouter>
  );
};

const mockAvailableProduct: Product = {
  id: 1,
  name: "Test Product",
  brand: "Test Brand",
  price: "199",
  available: true,
  weight: 0.5,
  options: [
    { color: "blue", quantity: 10 },
    { color: "red", quantity: 5 },
  ],
};

const mockUnavailableProduct: Product = {
  id: 2,
  name: "Unavailable Product",
  brand: "Test Brand",
  price: "299",
  available: false,
  weight: 0.5,
  options: [{ color: "blue", quantity: 0 }],
};

const mockOutOfStockProduct: Product = {
  id: 3,
  name: "Out of Stock Product",
  brand: "Test Brand",
  price: "399",
  available: true,
  weight: 0.5,
  options: [{ color: "blue", quantity: 0 }],
};

describe("ProductCard", () => {
  beforeEach(() => {
    mockToast.mockClear();
    localStorage.clear();
  });

  describe("rendering available product", () => {
    it("should render product name", () => {
      renderProductCard(mockAvailableProduct);
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should render product brand", () => {
      renderProductCard(mockAvailableProduct);
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
    });

    it("should render formatted price", () => {
      renderProductCard(mockAvailableProduct);
      expect(screen.getByText(/199/)).toBeInTheDocument();
    });

    it("should render weight", () => {
      renderProductCard(mockAvailableProduct);
      expect(screen.getByText(/0.5/)).toBeInTheDocument();
    });

    it("should render product image", () => {
      renderProductCard(mockAvailableProduct);
      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src");
    });

    it("should render add to cart button", () => {
      renderProductCard(mockAvailableProduct);
      const button = screen.getByRole("button", { name: /addToCart/i });
      expect(button).toBeInTheDocument();
    });

    it("should not render out of stock badge", () => {
      renderProductCard(mockAvailableProduct);
      expect(screen.queryByText("outOfStock")).not.toBeInTheDocument();
    });

    it("should have hover effects", () => {
      renderProductCard(mockAvailableProduct);
      const heading = screen.getByText("Test Product");
      const card = heading.closest('[class*="rounded-lg"]');
      expect(card).toHaveClass("hover:shadow-lg");
    });
  });

  describe("rendering unavailable product", () => {
    it("should render product with reduced opacity", () => {
      renderProductCard(mockUnavailableProduct);
      const heading = screen.getByText("Unavailable Product");
      const card = heading.closest('[class*="rounded-lg"]');
      expect(card).toHaveClass("opacity-60");
    });

    it("should render out of stock badge", () => {
      renderProductCard(mockUnavailableProduct);
      expect(screen.getByText("outOfStock")).toBeInTheDocument();
    });

    it("should render disabled add to cart button", () => {
      renderProductCard(mockUnavailableProduct);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should display unavailable text on button", () => {
      renderProductCard(mockUnavailableProduct);
      expect(screen.getByText("unavailable")).toBeInTheDocument();
    });

    it("should apply grayscale filter", () => {
      renderProductCard(mockUnavailableProduct);
      const heading = screen.getByText("Unavailable Product");
      const card = heading.closest('[class*="rounded-lg"]');
      expect(card).toHaveClass("grayscale");
    });

    it("should not be clickable", () => {
      renderProductCard(mockUnavailableProduct);
      const link = screen.queryByRole("link");
      expect(link).not.toBeInTheDocument();
    });
  });

  describe("rendering out of stock product", () => {
    it("should render out of stock badge", () => {
      renderProductCard(mockOutOfStockProduct);
      expect(screen.getByText("outOfStock")).toBeInTheDocument();
    });

    it("should render disabled button", () => {
      renderProductCard(mockOutOfStockProduct);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("add to cart functionality", () => {
    it("should add product to cart when button clicked", async () => {
      const user = userEvent.setup();
      renderProductCard(mockAvailableProduct);

      const button = screen.getByRole("button", { name: /addToCart/i });
      await user.click(button);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart).toHaveLength(1);
      expect(savedCart[0].productId).toBe(1);
      expect(savedCart[0].name).toBe("Test Product");
    });

    it("should show toast notification when adding to cart", async () => {
      const user = userEvent.setup();
      renderProductCard(mockAvailableProduct);

      const button = screen.getByRole("button", { name: /addToCart/i });
      await user.click(button);

      expect(mockToast).toHaveBeenCalledWith({
        title: "addedToCart",
        description: expect.stringContaining("Test Product"),
      });
    });

    it("should show success state after adding to cart", async () => {
      const user = userEvent.setup();
      renderProductCard(mockAvailableProduct);

      const button = screen.getByRole("button", { name: /addToCart/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("check-icon")).toBeInTheDocument();
      });
    });

    it("should add first available option to cart", async () => {
      const user = userEvent.setup();
      renderProductCard(mockAvailableProduct);

      const button = screen.getByRole("button", { name: /addToCart/i });
      await user.click(button);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart[0].selectedVariant).toEqual({ color: "blue" });
    });

    it("should not add unavailable product to cart", async () => {
      const user = userEvent.setup();
      renderProductCard(mockUnavailableProduct);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart).toHaveLength(0);
    });

    it("should stop event propagation when clicking add to cart", async () => {
      const user = userEvent.setup();
      renderProductCard(mockAvailableProduct);

      const button = screen.getByRole("button", { name: /addToCart/i });
      await user.click(button);

      // Should not navigate to product details page
      expect(window.location.pathname).toBe("/");
    });
  });

  describe("navigation", () => {
    it("should render link to product details for available product", () => {
      renderProductCard(mockAvailableProduct);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/product/1");
    });

    it("should not render link for unavailable product", () => {
      renderProductCard(mockUnavailableProduct);
      const link = screen.queryByRole("link");
      expect(link).not.toBeInTheDocument();
    });
  });

  describe("product availability calculation", () => {
    it("should show as available when product.available is true and has stock", () => {
      renderProductCard(mockAvailableProduct);
      const button = screen.getByRole("button", { name: /addToCart/i });
      expect(button).not.toBeDisabled();
    });

    it("should show as unavailable when product.available is false", () => {
      renderProductCard(mockUnavailableProduct);
      expect(screen.getByText("outOfStock")).toBeInTheDocument();
    });

    it("should show as unavailable when all options have zero quantity", () => {
      renderProductCard(mockOutOfStockProduct);
      expect(screen.getByText("outOfStock")).toBeInTheDocument();
    });

    it("should calculate total stock from all options", () => {
      const product = {
        ...mockAvailableProduct,
        options: [
          { color: "blue", quantity: 5 },
          { color: "red", quantity: 3 },
          { color: "green", quantity: 2 },
        ],
      };
      renderProductCard(product);
      const button = screen.getByRole("button", { name: /addToCart/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("variant handling", () => {
    it("should handle products with multiple variant attributes", async () => {
      const user = userEvent.setup();
      const product: Product = {
        id: 1,
        name: "Complex Product",
        brand: "Brand",
        price: "299",
        available: true,
        weight: 1.0,
        options: [{ color: "blue", power: [100, 200], quantity: 5 }],
      };

      renderProductCard(product);
      const button = screen.getByRole("button", { name: /addToCart/i });
      await user.click(button);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart[0].selectedVariant).toHaveProperty("color");
      expect(savedCart[0].selectedVariant).toHaveProperty("power");
    });

    it("should handle array values in variants", async () => {
      const user = userEvent.setup();
      const product: Product = {
        id: 1,
        name: "Array Variant Product",
        brand: "Brand",
        price: "299",
        available: true,
        weight: 1.0,
        options: [{ storage: ["32GB", "64GB"], quantity: 5 }],
      };

      renderProductCard(product);
      const button = screen.getByRole("button", { name: /addToCart/i });
      await user.click(button);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart[0].selectedVariant.storage).toBe("32GB");
    });
  });

  describe("accessibility", () => {
    it("should have accessible button for available products", () => {
      renderProductCard(mockAvailableProduct);
      const button = screen.getByRole("button", { name: /addToCart/i });
      expect(button).toBeInTheDocument();
    });

    it("should have disabled button for unavailable products", () => {
      renderProductCard(mockUnavailableProduct);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should have alt text for product image", () => {
      renderProductCard(mockAvailableProduct);
      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
    });
  });
});
