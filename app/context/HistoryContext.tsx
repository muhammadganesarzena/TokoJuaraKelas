import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { mapOrderRowToHistoryItem } from "../../lib/orders";
import { supabase } from "../../lib/supabase";

export type HistoryItem = {
  id: string;
  refNumber: string;
  pickupCode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  fulfillmentType?: string;
  paymentTime: string;
  totalPrice: number;
  adminFee: number;
  shippingFee?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  houseNote?: string;
  deliveryDistanceKm?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  products: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: any;
  }[];
  status:
    | "completed"
    | "processing"
    | "delivering"
    | "ready_for_pickup"
    | "cancelled";
};

type HistoryContextType = {
  historyItems: HistoryItem[];
  addHistory: (item: HistoryItem) => void;
  deleteHistory: (id: string) => void;
  completeOrder: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  loadingHistory: boolean;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async (uid: string, silent = false) => {
    if (!silent) setLoadingHistory(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHistoryItems(
        data.map((row) => mapOrderRowToHistoryItem(row as Record<string, unknown>)),
      );
    }

    if (!silent) setLoadingHistory(false);
  }, []);

  const refreshHistory = useCallback(async () => {
    if (!userId) return;
    await fetchHistory(userId);
  }, [userId, fetchHistory]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchHistory(user.id);
      } else {
        setLoadingHistory(false);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          await fetchHistory(session.user.id);
        } else {
          setUserId(null);
          setHistoryItems([]);
          setLoadingHistory(false);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [fetchHistory]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`orders-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void fetchHistory(userId, true);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, fetchHistory]);

  const addHistory = async (item: HistoryItem) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("order_history")
      .insert({
        user_id: userId,
        ref_number: item.refNumber,
        payment_time: item.paymentTime,
        total_price: item.totalPrice,
        admin_fee: 0,
        shipping_fee: item.shippingFee || 0,
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: item.address,
        house_note: item.houseNote || null,
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

  const completeOrder = async (id: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "selesai" })
      .eq("id", id);

    if (!error) {
      setHistoryItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "completed" } : item,
        ),
      );
    } else {
      throw error;
    }
  };

  return (
    <HistoryContext.Provider
      value={{
        historyItems,
        addHistory,
        deleteHistory,
        completeOrder,
        refreshHistory,
        loadingHistory,
      }}
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
