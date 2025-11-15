import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Header } from "./Header";
import { CartProvider } from "@/contexts/CartContext";
import { CartItem } from "@/contexts/CartContext.types";

const renderHeader = (cartItems: CartItem[] = []) => {
  // Pre-populate localStorage if cart items provided
  if (cartItems.length > 0) {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }

  return render(
    <BrowserRouter>
      <CartProvider>
        <Header />
      </CartProvider>
    </BrowserRouter>
  );
};

describe("Header", () => {
  describe("rendering", () => {
    it("should render header element", () => {
      renderHeader();
      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
    });

    it("should render logo with shopping cart icon", () => {
      renderHeader();
      const icons = screen.getAllByTestId("shopping-cart-icon");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should render shop brand name", () => {
      renderHeader();
      const brand = screen.getByText("Shop");
      expect(brand).toBeInTheDocument();
    });

    it("should render navigation", () => {
      renderHeader();
      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should render cart link", () => {
      renderHeader();
      const cartLink = screen.getByText("cart");
      expect(cartLink).toBeInTheDocument();
    });

    it("should render language switcher", () => {
      renderHeader();
      const languageIcon = screen.getByTestId("languages-icon");
      expect(languageIcon).toBeInTheDocument();
    });
  });

  describe("links", () => {
    it("should have home link with correct href", () => {
      renderHeader();
      const homeLink = screen.getByRole("link", { name: /shop/i });
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("should have checkout link with correct href", () => {
      renderHeader();
      const checkoutLink = screen.getByRole("link", { name: /cart/i });
      expect(checkoutLink).toHaveAttribute("href", "/checkout");
    });
  });

  describe("cart badge", () => {
    it("should not display badge when cart is empty", () => {
      renderHeader([]);
      const badge = screen.queryByText(/^\d+$/);
      expect(badge).not.toBeInTheDocument();
    });

    it("should display badge with count when cart has items", () => {
      const cartItems = [
        {
          productId: 1,
          name: "Product 1",
          brand: "Brand 1",
          price: "100",
          quantity: 2,
          selectedVariant: { color: "blue" },
          variantKey: JSON.stringify({ color: "blue" }),
        },
      ];
      renderHeader(cartItems);
      const badge = screen.getByText("2");
      expect(badge).toBeInTheDocument();
    });

    it("should display correct count for multiple items", () => {
      const cartItems = [
        {
          productId: 1,
          name: "Product 1",
          brand: "Brand 1",
          price: "100",
          quantity: 2,
          selectedVariant: { color: "blue" },
          variantKey: JSON.stringify({ color: "blue" }),
        },
        {
          productId: 2,
          name: "Product 2",
          brand: "Brand 2",
          price: "200",
          quantity: 3,
          selectedVariant: { color: "red" },
          variantKey: JSON.stringify({ color: "red" }),
        },
      ];
      renderHeader(cartItems);
      const badge = screen.getByText("5");
      expect(badge).toBeInTheDocument();
    });

    it("should display single digit count", () => {
      const cartItems = [
        {
          productId: 1,
          name: "Product 1",
          brand: "Brand 1",
          price: "100",
          quantity: 1,
          selectedVariant: { color: "blue" },
          variantKey: JSON.stringify({ color: "blue" }),
        },
      ];
      renderHeader(cartItems);
      const badge = screen.getByText("1");
      expect(badge).toBeInTheDocument();
    });

    it("should display double digit count", () => {
      const cartItems = [
        {
          productId: 1,
          name: "Product 1",
          brand: "Brand 1",
          price: "100",
          quantity: 15,
          selectedVariant: { color: "blue" },
          variantKey: JSON.stringify({ color: "blue" }),
        },
      ];
      renderHeader(cartItems);
      const badge = screen.getByText("15");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper heading hierarchy", () => {
      renderHeader();
      const brand = screen.getByText("Shop");
      expect(brand).toBeInTheDocument();
    });

    it("should have accessible navigation", () => {
      renderHeader();
      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should have accessible links", () => {
      renderHeader();
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });
});
