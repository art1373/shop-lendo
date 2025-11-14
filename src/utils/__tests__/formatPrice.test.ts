import { describe, it, expect } from "vitest";
import { formatPrice } from "../formatPrice";

describe("formatPrice", () => {
  describe("string input", () => {
    it("should format integer price string", () => {
      expect(formatPrice("100")).toBe("100");
    });

    it("should format decimal price string with 2 decimals", () => {
      expect(formatPrice("99.99")).toBe("99,99");
    });

    it("should format decimal price string with 1 decimal", () => {
      expect(formatPrice("50.5")).toBe("50,5");
    });

    it("should format large price with thousands separator", () => {
      expect(formatPrice("1000")).toBe("1\u00A0000");
    });

    it("should format very large price with multiple separators", () => {
      expect(formatPrice("1234567.89")).toBe("1\u00A0234\u00A0567,89");
    });

    it("should handle price with trailing zeros", () => {
      const result = formatPrice("100.00");
      // Swedish locale removes trailing zeros
      expect(result).toBe("100");
    });

    it("should handle zero price", () => {
      expect(formatPrice("0")).toBe("0");
    });

    it("should handle small decimal values", () => {
      expect(formatPrice("0.99")).toBe("0,99");
    });
  });

  describe("number input", () => {
    it("should format integer number", () => {
      expect(formatPrice(100)).toBe("100");
    });

    it("should format decimal number with 2 decimals", () => {
      expect(formatPrice(99.99)).toBe("99,99");
    });

    it("should format decimal number with 1 decimal", () => {
      expect(formatPrice(50.5)).toBe("50,5");
    });

    it("should format large number with thousands separator", () => {
      expect(formatPrice(1000)).toBe("1\u00A0000");
    });

    it("should format very large number with multiple separators", () => {
      expect(formatPrice(1234567.89)).toBe("1\u00A0234\u00A0567,89");
    });

    it("should handle zero", () => {
      expect(formatPrice(0)).toBe("0");
    });

    it("should handle small decimal values", () => {
      expect(formatPrice(0.99)).toBe("0,99");
    });

    it("should handle negative numbers", () => {
      // Swedish locale uses U+2212 (minus sign) instead of hyphen-minus
      const result = formatPrice(-100);
      expect(result).toContain("100");
      expect(result.startsWith("−") || result.startsWith("-")).toBe(true);
    });

    it("should handle negative decimal numbers", () => {
      // Swedish locale uses U+2212 (minus sign) instead of hyphen-minus
      const result = formatPrice(-99.99);
      expect(result).toContain("99");
      expect(result).toContain(",");
      expect(result.startsWith("−") || result.startsWith("-")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle very small decimals", () => {
      expect(formatPrice(0.01)).toBe("0,01");
    });

    it("should truncate to maximum 2 decimal places", () => {
      expect(formatPrice(99.999)).toBe("100");
    });

    it("should handle numbers with many decimal places", () => {
      expect(formatPrice(12.3456789)).toBe("12,35");
    });

    it("should format price with no decimal part", () => {
      expect(formatPrice(500.0)).toBe("500");
    });
  });

  describe("Swedish locale formatting", () => {
    it("should use comma as decimal separator", () => {
      expect(formatPrice(10.5)).toContain(",");
    });

    it("should use non-breaking space as thousands separator", () => {
      expect(formatPrice(1000)).toContain("\u00A0");
    });

    it("should format typical Swedish prices correctly", () => {
      expect(formatPrice("299.90")).toBe("299,9");
      expect(formatPrice("1499.00")).toBe("1\u00A0499");
      expect(formatPrice("9999.99")).toBe("9\u00A0999,99");
    });
  });

  describe("mixed input types", () => {
    it("should handle string that looks like number", () => {
      expect(formatPrice("1234.56")).toBe("1\u00A0234,56");
    });

    it("should handle number that equals string", () => {
      expect(formatPrice(1234.56)).toBe(formatPrice("1234.56"));
    });
  });
});
