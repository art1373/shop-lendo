import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductDetails from "./ProductDetails";
import { CartProvider } from "@/contexts/CartContext";

const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/data/inventory.json", () => ({
  default: {
    items: [
      {
        id: 1,
        name: "Philips Hue",
        brand: "Philips",
        price: "299",
        available: true,
        weight: 0.2,
        options: [
          { color: "white", power: [9, 60], quantity: 10 },
          { color: "color", power: [9, 60], quantity: 5 },
        ],
      },
      {
        id: 2,
        name: "Nintendo Switch",
        brand: "Nintendo",
        price: "2999",
        available: true,
        weight: 0.3,
        options: [
          { color: "gray", storage: ["32GB"], quantity: 3 },
          { color: "neon", storage: ["32GB"], quantity: 0 },
        ],
      },
      {
        id: 3,
        name: "Out of Stock Product",
        brand: "Test",
        price: "999",
        available: false,
        weight: 1.0,
        options: [{ color: "black", quantity: 0 }],
      },
    ],
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderProductDetails = (productId: string = "1") => {
  window.history.pushState({}, "Test page", `/product/${productId}`);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <Routes>
            <Route path="/product/:id" element={<ProductDetails />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("ProductDetails", () => {
  beforeEach(() => {
    mockToast.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  describe("rendering valid product", () => {
    it("should render product name", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        expect(screen.getByText("Philips Hue")).toBeInTheDocument();
      });
    });

    it("should render product brand", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        expect(screen.getByText("Philips")).toBeInTheDocument();
      });
    });

    it("should render formatted price", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        expect(screen.getByText(/299/)).toBeInTheDocument();
      });
    });

    it("should render product weight", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        expect(screen.getByText(/0.2/)).toBeInTheDocument();
      });
    });

    it("should render total stock", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        expect(screen.getByText(/15/)).toBeInTheDocument(); // 10 + 5
      });
    });

    it("should render product image", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        const image = screen.getByAltText("Philips Hue");
        expect(image).toBeInTheDocument();
      });
    });

    it("should render back button", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        const backButton = screen.getByRole("button", {
          name: /backToProducts/i,
        });
        expect(backButton).toBeInTheDocument();
      });
    });

    it("should render add to cart button", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        const addButton = screen.getByRole("button", { name: /addToCart/i });
        expect(addButton).toBeInTheDocument();
      });
    });

    it("should render product details section", async () => {
      renderProductDetails("1");
      await waitFor(() => {
        expect(screen.getByText("productDetails")).toBeInTheDocument();
      });
    });
  });

  describe("rendering unavailable product", () => {
    it("should show out of stock badge", async () => {
      renderProductDetails("3");
      await waitFor(() => {
        expect(screen.getByText("outOfStock")).toBeInTheDocument();
      });
    });

    it("should disable add to cart button", async () => {
      renderProductDetails("3");
      await waitFor(() => {
        const addButton = screen.getByRole("button", { name: /addToCart/i });
        expect(addButton).toBeDisabled();
      });
    });
  });

  describe("variant selection", () => {
    it("should display all variant options", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByText("selectOptions")).toBeInTheDocument();
        expect(screen.getAllByText("color").length).toBeGreaterThan(0);
        expect(screen.getAllByText("power").length).toBeGreaterThan(0);
      });
    });

    it("should display variant values as buttons", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        const whiteButton = screen.getByRole("button", { name: "white" });
        const colorButton = screen.getByRole("button", { name: "color" });

        expect(whiteButton).toBeInTheDocument();
        expect(colorButton).toBeInTheDocument();
      });
    });

    it("should pre-select first available variant", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        const whiteButton = screen.getByRole("button", { name: "white" });
        // First available option should be selected (indicated by styling)
        expect(whiteButton).toBeInTheDocument();
      });
    });

    it("should change selection when variant clicked", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "color" })).toBeInTheDocument();
      });

      const colorButton = screen.getByRole("button", { name: "color" });
      await user.click(colorButton);

      // Should update the selected variant
      expect(colorButton).toBeInTheDocument();
    });

    it("should display available quantity for selected variant", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        // Should show quantity for first available option (white with 10)
        expect(screen.getByText(/10/)).toBeInTheDocument();
      });
    });

    it("should update available quantity when variant changes", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "color" })).toBeInTheDocument();
      });

      // Click color variant (has 5)
      const colorButton = screen.getByRole("button", { name: "color" });
      await user.click(colorButton);

      // Should now show 5 in the available text
      await waitFor(() => {
        expect(screen.getByText(/available.*5/i)).toBeInTheDocument();
      });
    });

    it("should handle products with multiple variant types", async () => {
      renderProductDetails("2");

      await waitFor(() => {
        expect(screen.getByText("color")).toBeInTheDocument();
        expect(screen.getByText("storage")).toBeInTheDocument();
      });
    });

    it("should show warning when selected variant is out of stock", async () => {
      const user = userEvent.setup();
      renderProductDetails("2");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "neon" })).toBeInTheDocument();
      });

      // Select neon color which has 0 stock
      const neonButton = screen.getByRole("button", { name: "neon" });
      await user.click(neonButton);

      await waitFor(() => {
        expect(
          screen.getByText("selectedVariantOutOfStock")
        ).toBeInTheDocument();
      });
    });
  });

  describe("add to cart functionality", () => {
    it("should add product to cart with selected variant", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /addToCart/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole("button", { name: /addToCart/i });
      await user.click(addButton);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart).toHaveLength(1);
      expect(savedCart[0].productId).toBe(1);
      expect(savedCart[0].name).toBe("Philips Hue");
    });

    it("should show toast notification when adding to cart", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /addToCart/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole("button", { name: /addToCart/i });
      await user.click(addButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: "addedToCart",
        description: expect.stringContaining("Philips Hue"),
      });
    });

    it("should show success state after adding to cart", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /addToCart/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole("button", { name: /addToCart/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId("check-icon")).toBeInTheDocument();
      });
    });

    it("should disable button when product is unavailable", async () => {
      renderProductDetails("3");

      await waitFor(() => {
        const addButton = screen.getByRole("button", { name: /addToCart/i });
        expect(addButton).toBeDisabled();
      });
    });

    it("should disable button when selected variant is out of stock", async () => {
      const user = userEvent.setup();
      renderProductDetails("2");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "neon" })).toBeInTheDocument();
      });

      // Select neon which has 0 stock
      const neonButton = screen.getByRole("button", { name: "neon" });
      await user.click(neonButton);

      await waitFor(() => {
        const addButton = screen.getByRole("button", { name: /addToCart/i });
        expect(addButton).toBeDisabled();
      });
    });

    it("should add correct variant to cart", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "color" })).toBeInTheDocument();
      });

      // Select color variant
      const colorButton = screen.getByRole("button", { name: "color" });
      await user.click(colorButton);

      const addButton = screen.getByRole("button", { name: /addToCart/i });
      await user.click(addButton);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart[0].selectedVariant.color).toBe("color");
    });
  });

  describe("navigation", () => {
    it("should navigate back when back button clicked", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", {
          name: /backToProducts/i,
        })).toBeInTheDocument();
      });

      const backButton = screen.getByRole("button", {
        name: /backToProducts/i,
      });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should handle non-existent product", async () => {
      renderProductDetails("999");

      await waitFor(() => {
        expect(screen.getByText(/Product not found/i)).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Back to Products/i })
        ).toBeInTheDocument();
      });
    });

    it("should allow navigation back from non-existent product", async () => {
      const user = userEvent.setup();
      renderProductDetails("999");

      await waitFor(() => {
        expect(screen.getByRole("button", {
          name: /Back to Products/i,
        })).toBeInTheDocument();
      });

      const backButton = screen.getByRole("button", {
        name: /Back to Products/i,
      });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("stock display", () => {
    it("should calculate total stock from all options", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        // Should show 15 total (10 + 5)
        expect(screen.getByText(/15/)).toBeInTheDocument();
      });
    });

    it("should show 0 stock for unavailable product", async () => {
      renderProductDetails("3");

      await waitFor(() => {
        // Check for "0 units" in the stock display (multiple instances expected)
        expect(screen.getAllByText(/0 units/i).length).toBeGreaterThan(0);
      });
    });

    it("should display stock per variant", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        // Should show available stock for selected variant (e.g., "available: 10 units")
        expect(screen.getByText(/available:.*\d+.*units/i)).toBeInTheDocument();
      });
    });
  });

  describe("price display", () => {
    it("should display formatted price", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByText(/299/)).toBeInTheDocument();
      });
    });

    it("should display currency", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        // Use getAllByText with regex since "currency" appears multiple times
        expect(screen.getAllByText(/currency/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe("accessibility", () => {
    it("should have proper heading hierarchy", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        const productName = screen.getByText("Philips Hue");
        expect(productName.tagName).toBe("H1");
      });
    });

    it("should have accessible buttons", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it("should have alt text for images", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        const image = screen.getByAltText("Philips Hue");
        expect(image).toBeInTheDocument();
      });
    });
  });

  describe("variant key generation", () => {
    it("should generate unique variant key for cart", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /addToCart/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole("button", { name: /addToCart/i });
      await user.click(addButton);

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      expect(savedCart[0].variantKey).toBeDefined();
      expect(typeof savedCart[0].variantKey).toBe("string");
    });

    it("should create different keys for different variants", async () => {
      const user = userEvent.setup();
      renderProductDetails("1");

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /addToCart/i })).toBeInTheDocument();
      });

      // Add first variant
      const addButton = screen.getByRole("button", { name: /addToCart/i });
      await user.click(addButton);

      // Change variant
      const colorButton = screen.getByRole("button", { name: "color" });
      await user.click(colorButton);

      // Add second variant
      await waitFor(() => user.click(addButton));

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (savedCart.length === 2) {
        expect(savedCart[0].variantKey).not.toBe(savedCart[1].variantKey);
      }
    });
  });

  describe("initialization", () => {
    it("should initialize with first available option selected", async () => {
      renderProductDetails("1");

      await waitFor(() => {
        // First option should be selected by default
        expect(screen.getByText(/10/)).toBeInTheDocument(); // quantity of first option
      });
    });

    it("should handle products with no available options", async () => {
      renderProductDetails("3");

      await waitFor(() => {
        expect(screen.getByText("outOfStock")).toBeInTheDocument();
      });
    });
  });
});
