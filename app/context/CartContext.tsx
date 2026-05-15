import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Product } from "./ProductContext";

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  buyNow: (product: Product) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  loadingCart: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    // Ambil user saat ini
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchCart(user.id);
      }
      setLoadingCart(false);
    };
    init();

    // Listen perubahan auth (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          await fetchCart(session.user.id);
        } else {
          setUserId(null);
          setCartItems([]);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchCart = async (uid: string) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        products (
          id, name, price, image_url, description, brand, category_id
        )
      `,
      )
      .eq("user_id", uid);

    if (!error && data) {
      const mapped: CartItem[] = data.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          image: item.products.image_url
            ? { uri: item.products.image_url }
            : null,
          image_url: item.products.image_url,
          description: item.products.description,
          brand: item.products.brand,
          category_id: item.products.category_id,
        },
      }));
      setCartItems(mapped);
    }
  };

  const addToCart = async (product: Product) => {
    if (!userId) return;

    // Cek apakah sudah ada di cart
    const existing = cartItems.find((i) => i.product.id === product.id);

    if (existing) {
      // Update quantity
      const newQty = existing.quantity + 1;
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("id", existing.id);

      if (!error) {
        setCartItems((prev) =>
          prev.map((i) =>
            i.id === existing.id ? { ...i, quantity: newQty } : i,
          ),
        );
      }
    } else {
      // Insert baru
      const { data, error } = await supabase
        .from("cart_items")
        .insert({ user_id: userId, product_id: product.id, quantity: 1 })
        .select()
        .single();

      if (!error && data) {
        setCartItems((prev) => [
          ...prev,
          { id: data.id, product, quantity: 1 },
        ]);
      }
    }
  };

  const buyNow = async (product: Product) => {
    if (!userId) return false;

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);
    if (deleteError) return false;

    const { data, error } = await supabase
      .from("cart_items")
      .insert({ user_id: userId, product_id: product.id, quantity: 1 })
      .select()
      .single();

    if (error || !data) return false;

    setCartItems([{ id: data.id, product, quantity: 1 }]);
    return true;
  };


  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (!error) {
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
    }
  };

  const updateQuantity = async (cartItemId: string, delta: number) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", cartItemId);

    if (!error) {
      setCartItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i)),
      );
    }
  };

  const clearCart = async () => {
    if (!userId) return;
    await supabase.from("cart_items").delete().eq("user_id", userId);
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
        loadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
