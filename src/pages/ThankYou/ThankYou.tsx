import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getLastOrderDetails,
  clearLastOrderDetails,
} from "@/utils/mockStripePayment";
import { formatPrice } from "@/utils/formatPrice";
import { useTranslation } from "react-i18next";
import { getProductImage } from "@/utils/productImages";

const ThankYou = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [orderDetails, setOrderDetails] = useState(getLastOrderDetails());

  useEffect(() => {
    // If no order details, redirect to home
    if (!orderDetails) {
      navigate("/");
    }
  }, [orderDetails, navigate]);

  const handleBackToHome = () => {
    // Clear order details when going back home
    clearLastOrderDetails();
    navigate("/");
  };

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Thank You for Your Order!
            </CardTitle>
            <p className="text-muted-foreground">
              Your order has been successfully placed
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Transaction ID:{" "}
              <span className="font-mono">{orderDetails.transactionId}</span>
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantKey}`}
                    className="flex gap-4 p-4 rounded-lg bg-muted/30"
                  >
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      {getProductImage(item.productId) ? (
                        <img
                          src={getProductImage(item.productId)}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.brand}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground flex flex-col items-end justify-center">
                      <p className="font-semibold text-primary">
                        {formatPrice(Number(item.price) * item.quantity)}{" "}
                        {t("currency")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Paid:</span>
              <span className="text-primary">
                {formatPrice(orderDetails.total)} {t("currency")}
              </span>
            </div>

            <Separator />

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                A confirmation email has been sent to your email address.
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={handleBackToHome}>
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;
