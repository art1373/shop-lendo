import { useState, useEffect } from "react";
import { Product, ProductOption } from "@/types/product";

interface UseProductVariantSelectionResult {
  selectedVariant: Record<string, string>;
  setSelectedVariant: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedOption: ProductOption | null;
}

export const useProductVariantSelection = (
  product: Product | undefined
): UseProductVariantSelectionResult => {
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);

  // Initialize with first available option
  useEffect(() => {
    if (!product) return;

    const firstOption = product.options.find((opt) => opt.quantity > 0);
    if (firstOption) {
      const initialVariant: Record<string, string> = {};
      Object.keys(firstOption).forEach((key) => {
        if (key !== "quantity") {
          const value = firstOption[key as keyof ProductOption];
          if (Array.isArray(value)) {
            initialVariant[key] = String(value[0]);
          } else if (typeof value === "string") {
            initialVariant[key] = value;
          } else if (typeof value === "number") {
            initialVariant[key] = String(value);
          }
        }
      });
      setSelectedVariant(initialVariant);
    }
  }, [product]);

  // Find matching option based on selected variants
  useEffect(() => {
    if (!product) return;

    const matchingOption = product.options.find((option) => {
      return Object.keys(selectedVariant).every((key) => {
        const optionValue = option[key as keyof ProductOption];
        const selectedValue = selectedVariant[key];

        if (Array.isArray(optionValue)) {
          return optionValue.some((v) => String(v) === selectedValue);
        }
        if (typeof optionValue === "string") {
          return optionValue === selectedValue;
        }
        if (typeof optionValue === "number") {
          return String(optionValue) === selectedValue;
        }
        return false;
      });
    });

    setSelectedOption(matchingOption || null);
  }, [selectedVariant, product]);

  return {
    selectedVariant,
    setSelectedVariant,
    selectedOption,
  };
};
