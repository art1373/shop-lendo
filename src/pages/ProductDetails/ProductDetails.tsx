import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { Product, ProductOption } from "@/types/product";
import { getProductImage } from "@/utils/productImages";
import { formatPrice } from "@/utils/formatPrice";
import { useTranslation } from "react-i18next";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { data: inventory, isLoading, isError, error } = useProducts();

  const product = inventory?.items.find((p) => p.id === Number(id));
  const [selectedVariant, setSelectedVariant] = useState<
    Record<string, string>
  >({});
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(
    null
  );
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!product) return;

    // Initialize with first available option
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

  useEffect(() => {
    if (!product) return;

    // Find matching option based on selected variants
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

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("loading") || "Loading product..."}
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-xl font-semibold text-destructive mb-2">
            {t("error") || "Error loading product"}
          </p>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToProducts")}
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8">
        <p>Product not found</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const totalStock = product.options.reduce(
    (sum, option) => sum + option.quantity,
    0
  );
  const isAvailable = product.available && totalStock > 0;
  const canAddToCart =
    isAvailable && selectedOption && selectedOption.quantity > 0;

  const getVariantOptions = (key: string): string[] => {
    const values = new Set<string>();
    product.options.forEach((option) => {
      const value = option[key as keyof ProductOption];
      if (Array.isArray(value)) {
        value.forEach((v) => values.add(String(v)));
      } else if (value !== undefined && key !== "quantity") {
        values.add(String(value));
      }
    });
    return Array.from(values);
  };

  const variantKeys =
    product.options.length > 0
      ? Object.keys(product.options[0]).filter((key) => key !== "quantity")
      : [];

  const handleAddToCart = () => {
    if (!canAddToCart || !selectedOption) return;

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
    setTimeout(() => setShowSuccess(false), 1000);

    toast({
      title: t("addedToCart"),
      description: `${product.name} ${t("addedToCartDesc")}`,
    });
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToProducts")}
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-8 flex items-center justify-center min-h-[400px]">
            <img
              src={getProductImage(product.id)}
              alt={product.name}
              className="w-full h-full object-contain max-h-[400px]"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  {product.name}
                </h1>
                <p className="text-xl text-muted-foreground mt-1">
                  {product.brand}
                </p>
              </div>
              {!isAvailable && (
                <Badge variant="destructive">{t("outOfStock")}</Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-primary mt-4">
              {formatPrice(product.price)} {t("currency")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("productDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">{t("weight")}:</span>{" "}
                {product.weight} {t("kg")}
              </p>
              <p className="text-sm">
                <span className="font-medium">{t("availableStock")}:</span>{" "}
                {totalStock} {t("units")}
              </p>
            </CardContent>
          </Card>

          {variantKeys.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("selectOptions")}</CardTitle>
                <CardDescription>{t("chooseVariant")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {variantKeys.map((key) => (
                  <div key={key}>
                    <label className="text-sm font-medium capitalize mb-2 block">
                      {key}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getVariantOptions(key).map((value) => {
                        const isSelected = selectedVariant[key] === value;
                        return (
                          <Button
                            key={value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setSelectedVariant({
                                ...selectedVariant,
                                [key]: value,
                              })
                            }
                            className="capitalize"
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {selectedOption && (
                  <p className="text-sm text-muted-foreground">
                    {t("available")}: {selectedOption.quantity} {t("units")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={!canAddToCart || showSuccess}
            onClick={handleAddToCart}
          >
            {showSuccess ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                {t("addedToCart")}
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t("addToCart")}
              </>
            )}
          </Button>

          {!canAddToCart && isAvailable && (
            <p className="text-sm text-destructive text-center">
              {t("selectedVariantOutOfStock")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
