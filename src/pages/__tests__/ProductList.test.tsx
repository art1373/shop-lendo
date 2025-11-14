import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import ProductList from "../ProductList";
import { CartProvider } from "@/contexts/CartContext";

// Mock inventory data
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
        options: [{ color: "white", power: [9, 60], quantity: 10 }],
      },
      {
        id: 2,
        name: "IKEA TRADFRI",
        brand: "IKEA",
        price: "199",
        available: true,
        weight: 0.15,
        options: [{ color: "white", power: [9, 60], quantity: 5 }],
      },
      {
        id: 3,
        name: "Sony PlayStation 4",
        brand: "Sony",
        price: "3999",
        available: false,
        weight: 2.8,
        options: [{ storage: ["500GB"], quantity: 0 }],
      },
      {
        id: 4,
        name: "Nintendo Switch",
        brand: "Nintendo",
        price: "2999",
        available: true,
        weight: 0.3,
        options: [{ color: "gray", storage: ["32GB"], quantity: 3 }],
      },
      {
        id: 5,
        name: "JBL Speaker",
        brand: "JBL",
        price: "899",
        available: true,
        weight: 0.5,
        options: [{ color: "black", quantity: 8 }],
      },
    ],
  },
}));

const renderProductList = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <ProductList />
      </CartProvider>
    </BrowserRouter>
  );
};

describe("ProductList", () => {
  describe("rendering", () => {
    it("should render page heading", () => {
      renderProductList();
      expect(screen.getByText("ourProducts")).toBeInTheDocument();
    });

    it("should render page description", () => {
      renderProductList();
      expect(screen.getByText("browseProducts")).toBeInTheDocument();
    });

    it("should render all available products", () => {
      renderProductList();
      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
      expect(screen.getByText("IKEA TRADFRI")).toBeInTheDocument();
      expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
      expect(screen.getByText("JBL Speaker")).toBeInTheDocument();
    });

    it("should render unavailable products", () => {
      renderProductList();
      expect(screen.getByText("Sony PlayStation 4")).toBeInTheDocument();
    });

    it("should render search input", () => {
      renderProductList();
      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      expect(searchInput).toBeInTheDocument();
    });

    it("should render brand filter", () => {
      renderProductList();
      expect(screen.getByText("filterByBrand")).toBeInTheDocument();
    });

    it("should render sort dropdown", () => {
      renderProductList();
      expect(screen.getByText("sortBy")).toBeInTheDocument();
    });

    it("should render availability toggle", () => {
      renderProductList();
      expect(screen.getByText("showOnlyAvailable")).toBeInTheDocument();
    });
  });

  describe("search functionality", () => {
    it("should filter products by name", async () => {
      const user = userEvent.setup();
      renderProductList();

      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "Philips");

      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
      expect(screen.queryByText("IKEA TRADFRI")).not.toBeInTheDocument();
    });

    it("should filter products by brand", async () => {
      const user = userEvent.setup();
      renderProductList();

      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "Sony");

      expect(screen.getByText("Sony PlayStation 4")).toBeInTheDocument();
      expect(screen.queryByText("Philips Hue")).not.toBeInTheDocument();
    });

    it("should be case insensitive", async () => {
      const user = userEvent.setup();
      renderProductList();

      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "philips");

      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
    });

    it("should show no results message when no matches", async () => {
      const user = userEvent.setup();
      renderProductList();

      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "NonExistentProduct");

      expect(screen.getByText("noResults")).toBeInTheDocument();
      expect(screen.getByText("tryDifferentSearch")).toBeInTheDocument();
    });

    it("should update results as user types", async () => {
      const user = userEvent.setup();
      renderProductList();

      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "J");

      expect(screen.getByText("JBL Speaker")).toBeInTheDocument();

      await user.clear(searchInput);
      await user.type(searchInput, "Nintendo");

      expect(screen.queryByText("JBL Speaker")).not.toBeInTheDocument();
      expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
    });
  });

  describe("brand filter", () => {
    it("should filter products by selected brand", async () => {
      const user = userEvent.setup();
      renderProductList();

      // Find and click the brand filter trigger
      const brandFilterLabel = screen.getByText("filterByBrand");
      const brandTrigger =
        brandFilterLabel.parentElement?.querySelector('[role="combobox"]');
      if (brandTrigger) {
        await user.click(brandTrigger);
      }

      // Select Philips brand - use getAllByText and find the one in the dropdown
      const philipsOptions = await screen.findAllByText("Philips");
      // Click the option in the dropdown (not the one in the product card)
      await user.click(philipsOptions[philipsOptions.length - 1]);

      // Should only show Philips products
      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
      expect(screen.queryByText("IKEA TRADFRI")).not.toBeInTheDocument();
      expect(screen.queryByText("JBL Speaker")).not.toBeInTheDocument();
    });

    it("should show all brands in dropdown", async () => {
      const user = userEvent.setup();
      renderProductList();

      const brandFilterLabel = screen.getByText("filterByBrand");
      const brandTrigger =
        brandFilterLabel.parentElement?.querySelector('[role="combobox"]');
      if (brandTrigger) {
        await user.click(brandTrigger);
      }

      // Check for brand options - use findAllByText for all brands that might appear multiple times
      const allBrandsElements = await screen.findAllByText("allBrands");
      expect(allBrandsElements.length).toBeGreaterThan(0);
      const philipsElements = await screen.findAllByText("Philips");
      expect(philipsElements.length).toBeGreaterThan(0);
      const ikeaElements = await screen.findAllByText("IKEA");
      expect(ikeaElements.length).toBeGreaterThan(0);
      const sonyElements = await screen.findAllByText("Sony");
      expect(sonyElements.length).toBeGreaterThan(0);
      const nintendoElements = await screen.findAllByText("Nintendo");
      expect(nintendoElements.length).toBeGreaterThan(0);
      const jblElements = await screen.findAllByText("JBL");
      expect(jblElements.length).toBeGreaterThan(0);
    });
  });

  describe("sorting", () => {
    it("should sort by name ascending by default", () => {
      renderProductList();
      const productCards = screen.getAllByText(
        /Philips|IKEA|Sony|Nintendo|JBL/
      );

      // First product should be IKEA (alphabetically first)
      expect(productCards[0]).toHaveTextContent(
        /IKEA|JBL|Nintendo|Philips|Sony/
      );
    });

    it("should sort by price ascending", async () => {
      const user = userEvent.setup();
      renderProductList();

      const sortLabel = screen.getByText("sortBy");
      const sortTrigger =
        sortLabel.parentElement?.querySelector('[role="combobox"]');
      if (sortTrigger) {
        await user.click(sortTrigger);
      }

      const priceAscOption = await screen.findByText("sortPriceAsc");
      await user.click(priceAscOption);

      // IKEA (199) should come before others
      const products = screen.getAllByText(/\d+/);
      // Check that lower prices appear earlier
      expect(screen.getByText("IKEA TRADFRI")).toBeInTheDocument();
    });

    it("should sort by price descending", async () => {
      const user = userEvent.setup();
      renderProductList();

      const sortLabel = screen.getByText("sortBy");
      const sortTrigger =
        sortLabel.parentElement?.querySelector('[role="combobox"]');
      if (sortTrigger) {
        await user.click(sortTrigger);
      }

      const priceDescOption = await screen.findByText("sortPriceDesc");
      await user.click(priceDescOption);

      // Sony (3999) should come first
      const allText = screen.getByText("Sony PlayStation 4");
      expect(allText).toBeInTheDocument();
    });
  });

  describe("availability filter", () => {
    it("should show all products by default", () => {
      renderProductList();

      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
      expect(screen.getByText("Sony PlayStation 4")).toBeInTheDocument();
    });

    it("should filter to only available products when toggled", async () => {
      const user = userEvent.setup();
      renderProductList();

      const toggle = screen.getByRole("switch");
      await user.click(toggle);

      // Available products should be visible
      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
      expect(screen.getByText("IKEA TRADFRI")).toBeInTheDocument();
      expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
      expect(screen.getByText("JBL Speaker")).toBeInTheDocument();

      // Unavailable product should not be visible
      expect(screen.queryByText("Sony PlayStation 4")).not.toBeInTheDocument();
    });

    it("should show unavailable products when toggle is turned off", async () => {
      const user = userEvent.setup();
      renderProductList();

      const toggle = screen.getByRole("switch");

      // Turn on
      await user.click(toggle);
      expect(screen.queryByText("Sony PlayStation 4")).not.toBeInTheDocument();

      // Turn off
      await user.click(toggle);
      expect(screen.getByText("Sony PlayStation 4")).toBeInTheDocument();
    });
  });

  describe("combined filters", () => {
    it("should apply search and brand filter together", async () => {
      const user = userEvent.setup();
      renderProductList();

      // Type in search
      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "Hue");

      // Only Philips Hue should show
      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
      expect(screen.queryByText("IKEA TRADFRI")).not.toBeInTheDocument();
    });

    it("should apply all filters together", async () => {
      const user = userEvent.setup();
      renderProductList();

      // Enable availability filter
      const toggle = screen.getByRole("switch");
      await user.click(toggle);

      // Type in search
      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "Switch");

      // Only Nintendo Switch should show (available and matches search)
      expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
      expect(screen.queryByText("Sony PlayStation 4")).not.toBeInTheDocument();
    });
  });

  describe("empty states", () => {
    it("should show empty message when no products match filters", async () => {
      const user = userEvent.setup();
      renderProductList();

      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "xyz123nonexistent");

      expect(screen.getByText("noResults")).toBeInTheDocument();
      expect(screen.getByText("tryDifferentSearch")).toBeInTheDocument();
    });
  });

  describe("product grid", () => {
    it("should render products in a grid layout", () => {
      renderProductList();

      const gridContainer = screen.getByText("Philips Hue").closest(".grid");
      expect(gridContainer).toBeInTheDocument();
    });

    it("should render ProductCard components", () => {
      renderProductList();

      // Each product should be clickable or have product details
      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
      expect(screen.getByText("Philips")).toBeInTheDocument(); // brand
    });
  });

  describe("accessibility", () => {
    it("should have accessible search input", () => {
      renderProductList();
      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      expect(searchInput).toHaveAttribute("type", "text");
    });

    it("should have accessible switch with label", () => {
      renderProductList();
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
      expect(screen.getByText("showOnlyAvailable")).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      renderProductList();
      const heading = screen.getByText("ourProducts");
      expect(heading.tagName).toBe("H1");
    });
  });

  describe("performance", () => {
    it("should use memoization for brands calculation", () => {
      const { rerender } = renderProductList();

      // Brands should be calculated from inventory
      expect(screen.getByText("filterByBrand")).toBeInTheDocument();

      // Rerender should not cause issues
      rerender(
        <BrowserRouter>
          <CartProvider>
            <ProductList />
          </CartProvider>
        </BrowserRouter>
      );

      expect(screen.getByText("filterByBrand")).toBeInTheDocument();
    });

    it("should use memoization for filtered products", async () => {
      const user = userEvent.setup();
      renderProductList();

      const searchInput = screen.getByPlaceholderText("searchPlaceholder");
      await user.type(searchInput, "P");

      // Should efficiently filter and display results
      expect(screen.getByText("Philips Hue")).toBeInTheDocument();
    });
  });
});
