import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { totalItems } = useCart();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Shop</span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link
            to="/checkout"
            className="relative flex items-center space-x-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{t("cart")}</span>
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
};
