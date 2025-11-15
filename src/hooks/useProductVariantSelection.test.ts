import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useProductVariantSelection } from "./useProductVariantSelection";
import { Product } from "@/types/product";

describe("useProductVariantSelection", () => {
  const mockProduct: Product = {
    id: 1,
    name: "Test Product",
    brand: "Test Brand",
    price: "999",
    available: true,
    weight: 500,
    options: [
      {
        color: "black",
        power: [128, 256],
        storage: ["128GB", "256GB"],
        quantity: 5,
      },
      {
        color: "white",
        power: [256],
        storage: ["256GB"],
        quantity: 3,
      },
      {
        color: "blue",
        power: [512],
        storage: ["512GB"],
        quantity: 0,
      },
    ],
  };

  describe("initialization", () => {
    it("should initialize with the first available option (quantity > 0)", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      expect(result.current.selectedVariant).toEqual({
        color: "black",
        power: "128",
        storage: "128GB",
      });
      expect(result.current.selectedOption).toEqual(mockProduct.options[0]);
    });

    it("should handle product with no available options (all quantity = 0)", () => {
      const productNoStock: Product = {
        ...mockProduct,
        options: [
          {
            color: "red",
            power: [128],
            storage: ["128GB"],
            quantity: 0,
          },
        ],
      };

      const { result } = renderHook(() =>
        useProductVariantSelection(productNoStock)
      );

      expect(result.current.selectedVariant).toEqual({});
      expect(result.current.selectedOption).toEqual(productNoStock.options[0]);
    });

    it("should handle undefined product", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(undefined)
      );

      expect(result.current.selectedVariant).toEqual({});
      expect(result.current.selectedOption).toBeNull();
    });

    it("should skip the quantity field during initialization", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      expect(result.current.selectedVariant).not.toHaveProperty("quantity");
    });

    it("should convert array values to their first element as string", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      // power is [128, 256] array, should take first element
      expect(result.current.selectedVariant.power).toBe("128");
      // storage is ["128GB", "256GB"] array, should take first element
      expect(result.current.selectedVariant.storage).toBe("128GB");
    });

    it("should handle string values directly", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      // color is a string, should be used directly
      expect(result.current.selectedVariant.color).toBe("black");
    });

    it("should convert number values to strings", () => {
      const productWithNumber: Product = {
        ...mockProduct,
        options: [
          {
            size: 42,
            quantity: 5,
          },
        ],
      };

      const { result } = renderHook(() =>
        useProductVariantSelection(productWithNumber)
      );

      expect(result.current.selectedVariant.size).toBe("42");
    });
  });

  describe("variant selection and matching", () => {
    it("should update selectedVariant when setSelectedVariant is called", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      act(() => {
        result.current.setSelectedVariant({
          color: "white",
          power: "256",
          storage: "256GB",
        });
      });

      expect(result.current.selectedVariant).toEqual({
        color: "white",
        power: "256",
        storage: "256GB",
      });
    });

    it("should find matching option when variant is updated", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      act(() => {
        result.current.setSelectedVariant({
          color: "white",
          power: "256",
          storage: "256GB",
        });
      });

      expect(result.current.selectedOption).toEqual(mockProduct.options[1]);
    });

    it("should return null for selectedOption when no match is found", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      act(() => {
        result.current.setSelectedVariant({
          color: "green",
          power: "999",
          storage: "1TB",
        });
      });

      expect(result.current.selectedOption).toBeNull();
    });

    it("should match array values correctly", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      // First option has power: [128, 256], should match "256"
      act(() => {
        result.current.setSelectedVariant({
          color: "black",
          power: "256",
          storage: "256GB",
        });
      });

      expect(result.current.selectedOption).toEqual(mockProduct.options[0]);
    });

    it("should match string values correctly", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      act(() => {
        result.current.setSelectedVariant({
          color: "white",
          power: "256",
          storage: "256GB",
        });
      });

      expect(result.current.selectedOption?.color).toBe("white");
    });

    it("should match number values correctly", () => {
      const productWithNumber: Product = {
        ...mockProduct,
        options: [
          {
            size: 42,
            color: "black",
            quantity: 5,
          },
          {
            size: 44,
            color: "black",
            quantity: 3,
          },
        ],
      };

      const { result } = renderHook(() =>
        useProductVariantSelection(productWithNumber)
      );

      act(() => {
        result.current.setSelectedVariant({
          size: "44",
          color: "black",
        });
      });

      expect(result.current.selectedOption).toEqual(
        productWithNumber.options[1]
      );
    });

    it("should require all selected variant keys to match", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      // This should not match because storage doesn't match
      act(() => {
        result.current.setSelectedVariant({
          color: "white",
          power: "256",
          storage: "128GB",
        });
      });

      expect(result.current.selectedOption).toBeNull();
    });
  });

  describe("product updates", () => {
    it("should reinitialize when product changes", () => {
      const { result, rerender } = renderHook(
        ({ product }) => useProductVariantSelection(product),
        {
          initialProps: { product: mockProduct },
        }
      );

      const newProduct: Product = {
        ...mockProduct,
        id: 2,
        options: [
          {
            color: "red",
            power: [512],
            storage: ["512GB"],
            quantity: 10,
          },
        ],
      };

      rerender({ product: newProduct });

      expect(result.current.selectedVariant).toEqual({
        color: "red",
        power: "512",
        storage: "512GB",
      });
      expect(result.current.selectedOption).toEqual(newProduct.options[0]);
    });

    it("should update selectedOption when product changes", () => {
      const { result, rerender } = renderHook(
        ({ product }) => useProductVariantSelection(product),
        {
          initialProps: { product: mockProduct },
        }
      );

      // Select a specific variant
      act(() => {
        result.current.setSelectedVariant({
          color: "white",
          power: "256",
          storage: "256GB",
        });
      });

      // Change product but keep the same variant structure
      const updatedProduct: Product = {
        ...mockProduct,
        options: [
          {
            color: "white",
            power: [256],
            storage: ["256GB"],
            quantity: 10, // Updated quantity
          },
        ],
      };

      rerender({ product: updatedProduct });

      // Should match the new product's option
      expect(result.current.selectedOption?.quantity).toBe(10);
    });

    it("should handle product changing to undefined", () => {
      const { result, rerender } = renderHook(
        ({ product }) => useProductVariantSelection(product),
        {
          initialProps: { product: mockProduct },
        }
      );

      // Initially has a selected option
      expect(result.current.selectedOption).not.toBeNull();

      rerender({ product: undefined });

      // When product becomes undefined, the useEffect returns early
      // so selectedOption retains its last value (not cleared)
      // This is the actual behavior - it keeps the last selectedOption
      expect(result.current.selectedOption).toEqual(mockProduct.options[0]);

      // But if we manually change the variant after product is undefined
      act(() => {
        result.current.setSelectedVariant({ color: "new-color" });
      });

      // The selectedOption still won't update because product is undefined
      expect(result.current.selectedOption).toEqual(mockProduct.options[0]);
    });
  });

  describe("edge cases", () => {
    it("should handle product with empty options array", () => {
      const productNoOptions: Product = {
        ...mockProduct,
        options: [],
      };

      const { result } = renderHook(() =>
        useProductVariantSelection(productNoOptions)
      );

      expect(result.current.selectedVariant).toEqual({});
      expect(result.current.selectedOption).toBeNull();
    });

    it("should handle option with only quantity field", () => {
      const minimalProduct: Product = {
        ...mockProduct,
        options: [
          {
            quantity: 5,
          },
        ],
      };

      const { result } = renderHook(() =>
        useProductVariantSelection(minimalProduct)
      );

      expect(result.current.selectedVariant).toEqual({});
      expect(result.current.selectedOption).toEqual(minimalProduct.options[0]);
    });

    it("should handle partial variant selection", () => {
      const { result } = renderHook(() =>
        useProductVariantSelection(mockProduct)
      );

      // Select only color, not all attributes
      act(() => {
        result.current.setSelectedVariant({
          color: "white",
        });
      });

      expect(result.current.selectedVariant).toEqual({
        color: "white",
      });
      // The matching logic checks that all keys in selectedVariant match
      // Since only "color" is in selectedVariant, it will match the first option with color="white"
      expect(result.current.selectedOption).toEqual(mockProduct.options[1]);
      expect(result.current.selectedOption?.color).toBe("white");
    });

    it("should handle options with array color values", () => {
      const productWithArrayColor: Product = {
        ...mockProduct,
        options: [
          {
            color: ["black", "gray"],
            power: [128],
            storage: ["128GB"],
            quantity: 5,
          },
        ],
      };

      const { result } = renderHook(() =>
        useProductVariantSelection(productWithArrayColor)
      );

      // Should initialize with first color from array
      expect(result.current.selectedVariant.color).toBe("black");

      // Should match "gray" as it's in the array
      act(() => {
        result.current.setSelectedVariant({
          color: "gray",
          power: "128",
          storage: "128GB",
        });
      });

      expect(result.current.selectedOption).toEqual(
        productWithArrayColor.options[0]
      );
    });
  });
});
