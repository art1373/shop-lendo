import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/utils/formatPrice";
import { useTranslation } from "react-i18next";
import { getProductImage } from "@/utils/productImages";
import {
  processMockPayment,
  saveOrderDetails,
} from "@/utils/mockStripePayment";

const Checkout = () => {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const formatVariant = (variant: Record<string, string | string[]>) => {
    return Object.entries(variant)
      .map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : value;
        return `${key}: ${displayValue}`;
      })
      .join(" | ");
  };

  const proceedToCheckout = async () => {
    setIsProcessing(true);

    try {
      const result = await processMockPayment();

      if (result.success && result.transactionId) {
        // Save order details
        saveOrderDetails({
          items,
          total: subtotal,
          transactionId: result.transactionId,
          timestamp: new Date().toISOString(),
        });

        // Clear the cart
        clearCart();

        // Show success message
        toast({
          title: "Payment Successful!",
          description: "Thank you for your purchase.",
        });

        // Navigate to thank you page
        setTimeout(() => {
          navigate("/thank-you");
        }, 500);
      } else {
        // Show error message
        toast({
          title: "Payment Failed",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-16 pb-8">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("cartEmpty")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("cartEmptyDesc")}</p>
            <Button onClick={() => navigate("/")}>
              {t("browseProductsBtn")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold text-foreground mb-8">
        {t("shoppingCart")}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.productId}-${item.variantKey}`}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    {getProductImage(item.productId) ? (
                      <img
                        src={getProductImage(item.productId)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.brand}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize mb-3">
                      {formatVariant(item.selectedVariant)}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantKey,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantKey,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          removeItem(item.productId, item.variantKey)
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("remove")}
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(Number(item.price) * item.quantity)}{" "}
                      {t("currency")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{t("orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">
                  {formatPrice(subtotal)} {t("currency")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span className="font-medium">{t("calculatedAtCheckout")}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t("total")}</span>
                <span className="text-primary">
                  {formatPrice(subtotal)} {t("currency")}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="w-full"
                onClick={proceedToCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t("processingPayment")}
                  </>
                ) : (
                  t("proceedToCheckout")
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
