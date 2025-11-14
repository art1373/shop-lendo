import { describe, it, expect, vi } from "vitest";
import { getProductImage, productImages } from "../productImages";

// Mock image imports
vi.mock("@/assets/products/philips-hue.jpg", () => ({ default: "/mock/philips-hue.jpg" }));
vi.mock("@/assets/products/ikea-tradfri.jpg", () => ({ default: "/mock/ikea-tradfri.jpg" }));
vi.mock("@/assets/products/ps4.jpg", () => ({ default: "/mock/ps4.jpg" }));
vi.mock("@/assets/products/nintendo-switch.jpg", () => ({ default: "/mock/nintendo-switch.jpg" }));
vi.mock("@/assets/products/jbl-speaker.jpg", () => ({ default: "/mock/jbl-speaker.jpg" }));
vi.mock("@/assets/products/marshall-speaker.jpg", () => ({ default: "/mock/marshall-speaker.jpg" }));

describe("productImages", () => {
  describe("productImages object", () => {
    it("should contain mapping for product ID 1", () => {
      expect(productImages[1]).toBeDefined();
    });

    it("should contain mapping for product ID 2", () => {
      expect(productImages[2]).toBeDefined();
    });

    it("should contain mapping for product ID 3", () => {
      expect(productImages[3]).toBeDefined();
    });

    it("should contain mapping for product ID 4", () => {
      expect(productImages[4]).toBeDefined();
    });

    it("should contain mapping for product ID 5", () => {
      expect(productImages[5]).toBeDefined();
    });

    it("should contain mapping for product ID 6", () => {
      expect(productImages[6]).toBeDefined();
    });

    it("should have exactly 6 product mappings", () => {
      expect(Object.keys(productImages)).toHaveLength(6);
    });
  });

  describe("getProductImage", () => {
    it("should return correct image for product ID 1", () => {
      const image = getProductImage(1);
      expect(image).toBeDefined();
      expect(typeof image).toBe("string");
    });

    it("should return correct image for product ID 2", () => {
      const image = getProductImage(2);
      expect(image).toBeDefined();
      expect(typeof image).toBe("string");
    });

    it("should return correct image for product ID 3", () => {
      const image = getProductImage(3);
      expect(image).toBeDefined();
      expect(typeof image).toBe("string");
    });

    it("should return correct image for product ID 4", () => {
      const image = getProductImage(4);
      expect(image).toBeDefined();
      expect(typeof image).toBe("string");
    });

    it("should return correct image for product ID 5", () => {
      const image = getProductImage(5);
      expect(image).toBeDefined();
      expect(typeof image).toBe("string");
    });

    it("should return correct image for product ID 6", () => {
      const image = getProductImage(6);
      expect(image).toBeDefined();
      expect(typeof image).toBe("string");
    });

    it("should return fallback image for non-existent product ID", () => {
      const image = getProductImage(999);
      expect(image).toBeDefined();
      expect(image).toBe(productImages[1]); // Falls back to philips-hue
    });

    it("should return fallback image for product ID 0", () => {
      const image = getProductImage(0);
      expect(image).toBeDefined();
      expect(image).toBe(productImages[1]);
    });

    it("should return fallback image for negative product ID", () => {
      const image = getProductImage(-1);
      expect(image).toBeDefined();
      expect(image).toBe(productImages[1]);
    });

    it("should return same image for same product ID when called multiple times", () => {
      const image1 = getProductImage(1);
      const image2 = getProductImage(1);
      expect(image1).toBe(image2);
    });

    it("should return different images for different product IDs", () => {
      const image1 = getProductImage(1);
      const image2 = getProductImage(2);
      expect(image1).not.toBe(image2);
    });
  });

  describe("fallback behavior", () => {
    it("should always return a string", () => {
      const image = getProductImage(999);
      expect(typeof image).toBe("string");
    });

    it("should never return undefined", () => {
      const image = getProductImage(999);
      expect(image).not.toBeUndefined();
    });

    it("should never return null", () => {
      const image = getProductImage(999);
      expect(image).not.toBeNull();
    });

    it("should return fallback for very large product ID", () => {
      const image = getProductImage(Number.MAX_SAFE_INTEGER);
      expect(image).toBe(productImages[1]);
    });
  });
});
