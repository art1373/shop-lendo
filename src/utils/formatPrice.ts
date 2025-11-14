export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return numPrice.toLocaleString("sv-SE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
