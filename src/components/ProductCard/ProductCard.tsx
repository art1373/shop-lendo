import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/utils/productImages";
import { formatPrice } from "@/utils/formatPrice";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductCardProps } from "./ProductCard.types";

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const totalStock = product.options.reduce(
    (sum, option) => sum + option.quantity,
    0
  );
  const isAvailable = product.available && totalStock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) return;

    const firstAvailableOption = product.options.find(
      (opt) => opt.quantity > 0
    );
    if (!firstAvailableOption) return;

    const selectedVariant: Record<string, string> = {};
    Object.keys(firstAvailableOption).forEach((key) => {
      if (key !== "quantity") {
        const value =
          firstAvailableOption[key as keyof typeof firstAvailableOption];
        if (Array.isArray(value)) {
          selectedVariant[key] = String(value[0]);
        } else if (typeof value === "string") {
          selectedVariant[key] = value;
        } else if (typeof value === "number") {
          selectedVariant[key] = String(value);
        }
      }
    });

    const variantKey = JSON.stringify(selectedVariant);
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      selectedVariant,
      variantKey,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);

    toast({
      title: t("addedToCart"),
      description: `${product.name} ${t("addedToCartDesc")}`,
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isAvailable) {
      e.preventDefault();
    }
  };

  const cardContent = (
    <Card
      className={`flex flex-col h-full transition-all ${
        isAvailable
          ? "hover:shadow-lg cursor-pointer"
          : "opacity-60 cursor-not-allowed grayscale"
      }`}
    >
      <CardHeader className="pb-4">
        <div className="aspect-square relative overflow-hidden rounded-lg bg-muted mb-4">
          <img
            src={getProductImage(product.id)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="destructive" className="text-base px-4 py-2">
                {t("outOfStock")}
              </Badge>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg text-foreground line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-2xl font-bold text-primary">
          {formatPrice(product.price)} {t("currency")}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {t("weight")}: {product.weight} {t("kg")}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!isAvailable}
          onClick={handleAddToCart}
        >
          {showSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t("addedToCart")}
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isAvailable ? t("addToCart") : t("unavailable")}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  if (!isAvailable) {
    return <div className="block h-full">{cardContent}</div>;
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="block h-full"
      onClick={handleCardClick}
    >
      {cardContent}
    </Link>
  );
};
