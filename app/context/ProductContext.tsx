import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// ── Types ─────────────────────────────────────────────────────────
export type Brand = {
  id: string;
  name: string;
  logo: any;
  logoDark?: any;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: any;
  image_url?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category_id?: string;
};

type ProductContextType = {
  brands: Brand[];
  recommended: Product[];
  products: Product[];
  likedProducts: Record<string, boolean>;
  toggleLike: (id: string) => void;
  wishlist: Product[];
  loadingProducts: boolean;
  refreshProducts: () => void;
};

// ── Brands tetap pakai lokal ──────────────────────────────────────
const BRANDS: Brand[] = [
  {
    id: "1",
    name: "Gibson",
    logo: require("../../assets/images/TopBrands/gibson-1-logo-png-transparent.png"),
    logoDark: require("../../assets/images/TopBrands/gibson_transparent_logo_fixed2.png"),
  },
  {
    id: "2",
    name: "Fender",
    logo: require("../../assets/images/TopBrands/Fender Black.png"),
    logoDark: require("../../assets/images/TopBrands/Fender white.png"),
  },
  {
    id: "3",
    name: "Ibanez",
    logo: require("../../assets/images/TopBrands/Ibanez-Logo.png"),
    logoDark: require("../../assets/images/TopBrands/Ibanez white.png"),
  },
  {
    id: "4",
    name: "Yamaha",
    logo: require("../../assets/images/TopBrands/Yamaha_logo_PNG5.png"),
    logoDark: require("../../assets/images/TopBrands/yamaha.jpg"),
  },
  {
    id: "5",
    name: "Taylor",
    logo: require("../../assets/images/TopBrands/Taylor black.png"),
    logoDark: require("../../assets/images/TopBrands/Taylor White.png"),
  },
];

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>(
    {},
  );
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Mapping agar kompatibel dengan struktur Product yang dipakai Homepage
      const mapped: Product[] = data.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url ? { uri: p.image_url } : null,
        image_url: p.image_url,
        description: p.description,
        brand: p.brand,
        category_id: p.category_id,
        rating: 0,
        reviewCount: 0,
      }));
      setProducts(mapped);
    }
    setLoadingProducts(false);
  };

  const toggleLike = (id: string) => {
    setLikedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const wishlist = products.filter((p) => likedProducts[p.id]);

  // Recommended = 5 produk pertama
  const recommended = products.slice(0, 5);

  return (
    <ProductContext.Provider
      value={{
        brands: BRANDS,
        recommended,
        products,
        likedProducts,
        toggleLike,
        wishlist,
        loadingProducts,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
