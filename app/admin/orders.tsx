import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

type Order = {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
};

const STATUS_LIST = ["pending", "proses", "dikirim", "selesai", "batal"];

const statusColor = (s: string) => {
  switch (s) {
    case "pending":
      return "#FFA000";
    case "proses":
      return "#1976D2";
    case "dikirim":
      return "#7B1FA2";
    case "selesai":
      return "#388E3C";
    case "batal":
      return "#E53935";
    default:
      return "#888";
  }
};

export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const openDetail = (o: Order) => {
    setSelectedOrder(o);
    setOrderStatus(o.status);
    setModal(true);
  };

  const updateStatus = async () => {
    if (!selectedOrder) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("id", selectedOrder.id);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setModal(false);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Order" onMenuPress={() => setSidebarOpen(true)} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openDetail(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>#{item.id.slice(0, 8)}</Text>
                <Text style={styles.cardSub}>
                  Rp {item.total_price.toLocaleString("id-ID")}
                </Text>
                <Text style={styles.cardMeta}>
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: statusColor(item.status) },
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada order.</Text>
          }
        />
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { maxHeight: "60%" }]}>
            <Text style={styles.modalTitle}>Update Status Order</Text>
            <Text style={styles.orderId}>#{selectedOrder?.id.slice(0, 8)}</Text>
            <Text style={styles.orderPrice}>
              Rp {selectedOrder?.total_price.toLocaleString("id-ID")}
            </Text>

            {STATUS_LIST.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  orderStatus === s && { backgroundColor: statusColor(s) },
                ]}
                onPress={() => setOrderStatus(s)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    orderStatus === s && { color: "#fff" },
                  ]}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.saveBtn} onPress={updateStatus}>
              <Text style={styles.saveBtnText}>Simpan Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModal(false)}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/orders"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  cardSub: { fontSize: 12, color: "#2D6A4F", marginTop: 2 },
  cardMeta: { fontSize: 11, color: "#888", marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  modalBg: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  orderPrice: { fontSize: 13, color: "#2D6A4F", marginBottom: 16 },
  statusOption: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  statusOptionText: { fontSize: 14, fontWeight: "600", color: "#555" },
  saveBtn: {
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: "#888", fontSize: 14 },
});
