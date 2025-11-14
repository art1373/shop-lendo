import { useState, useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import inventoryData from "@/data/inventory.json";
import { Inventory } from "@/types/product";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProductList = () => {
  const { t } = useTranslation();
  const inventory = inventoryData as Inventory;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const brands = useMemo(() => {
    const brandSet = new Set(inventory.items.map((p) => p.brand));
    return Array.from(brandSet).sort();
  }, [inventory.items]);

  const filteredProducts = useMemo(() => {
    let filtered = inventory.items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
      );
    }

    if (selectedBrand !== "all") {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    if (showOnlyAvailable) {
      filtered = filtered.filter((product) => {
        const totalStock = product.options.reduce(
          (sum, option) => sum + option.quantity,
          0
        );
        return product.available && totalStock > 0;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        default:
          return 0;
      }
    });

    return sorted;
  }, [inventory.items, searchQuery, selectedBrand, sortBy, showOnlyAvailable]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {t("ourProducts")}
        </h1>
        <p className="text-muted-foreground">{t("browseProducts")}</p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="available-only"
            checked={showOnlyAvailable}
            onCheckedChange={setShowOnlyAvailable}
          />
          <Label htmlFor="available-only" className="cursor-pointer">
            {t("showOnlyAvailable")}
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t("filterByBrand")}
            </label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allBrands")}</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("sortBy")}</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">{t("sortNameAsc")}</SelectItem>
                <SelectItem value="name-desc">{t("sortNameDesc")}</SelectItem>
                <SelectItem value="price-asc">{t("sortPriceAsc")}</SelectItem>
                <SelectItem value="price-desc">{t("sortPriceDesc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl font-semibold text-muted-foreground mb-2">
            {t("noResults")}
          </p>
          <p className="text-muted-foreground">{t("tryDifferentSearch")}</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
