import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export type HistoryItem = {
  id: string;
  refNumber: string;
  paymentTime: string;
  totalPrice: number;
  adminFee: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  products: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: any;
  }[];
  status: "completed" | "processing" | "cancelled";
};

type HistoryContextType = {
  historyItems: HistoryItem[];
  addHistory: (item: HistoryItem) => void;
  deleteHistory: (id: string) => void;
  loadingHistory: boolean;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchHistory(user.id);
      }
      setLoadingHistory(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          await fetchHistory(session.user.id);
        } else {
          setUserId(null);
          setHistoryItems([]);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchHistory = async (uid: string) => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("order_history")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: HistoryItem[] = data.map((item: any) => ({
        id: item.id,
        refNumber: item.ref_number,
        paymentTime: item.payment_time,
        totalPrice: item.total_price,
        adminFee: item.admin_fee,
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: item.address,
        city: item.city,
        products: item.products,
        status: item.status,
      }));
      setHistoryItems(mapped);
    }
    setLoadingHistory(false);
  };

  const addHistory = async (item: HistoryItem) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("order_history")
      .insert({
        user_id: userId,
        ref_number: item.refNumber,
        payment_time: item.paymentTime,
        total_price: item.totalPrice,
        admin_fee: item.adminFee,
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: item.address,
        city: item.city,
        products: item.products,
        status: item.status,
      })
      .select()
      .single();

    if (!error && data) {
      setHistoryItems((prev) => [{ ...item, id: data.id }, ...prev]);
    }
  };

  const deleteHistory = async (id: string) => {
    const { error } = await supabase
      .from("order_history")
      .delete()
      .eq("id", id);

    if (!error) {
      setHistoryItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <HistoryContext.Provider
      value={{ historyItems, addHistory, deleteHistory, loadingHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
};
