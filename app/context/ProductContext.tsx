import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../../lib/supabase";

// ── Types ─────────────────────────────────────────────────────────
export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image?: { uri: string } | null;
  image_url?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category_id?: string;
};

type ProductContextType = {
  recommended: Product[];
  products: Product[];
  filteredProducts: Product[];
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  likedProducts: Record<string, boolean>;
  toggleLike: (id: string) => void;
  wishlist: Product[];
  loadingProducts: boolean;
  refreshProducts: () => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>(
    {},
  );
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch products error:", error);
      setLoadingProducts(false);
      return;
    }

    if (data) {
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
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.log("Fetch categories error:", error);
      return;
    }

    if (data) {
      setCategories(data);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchCategories, fetchProducts]);

  const toggleLike = (id: string) => {
    setLikedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter Products By Category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const wishlist = products.filter((p) => likedProducts[p.id]);

  // Recommended Products
  const recommended = products.slice(0, 5);

  return (
    <ProductContext.Provider
      value={{
        recommended,
        products,
        filteredProducts,
        categories,
        selectedCategory,
        setSelectedCategory,
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
