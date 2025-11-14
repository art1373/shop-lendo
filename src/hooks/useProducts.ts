import { useQuery } from "@tanstack/react-query";
import { Inventory } from "@/types/product";

// Mock fetch function that simulates an API call
const fetchProducts = async (): Promise<Inventory> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Dynamically import the JSON file
  const data = await import("@/data/inventory.json");
  return data.default as Inventory;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};
