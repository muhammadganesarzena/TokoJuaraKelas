import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  user_id: string;
  ref_number?: string;
  pickup_code?: string;
  total_price: number;
  subtotal?: number;
  admin_fee?: number;
  status: string;
  payment_status?: string;
  payment_proof_url?: string;
  payment_method?: string;
  fulfillment_type?: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  order_note?: string | null;
  items?: OrderItem[];
  created_at: string;
};

const statusColor = (s: string) => {
  switch (s) {
    case "pending":
      return "#F59E0B";
    case "accepted":
    case "selesai":
      return "#2D6A4F";
    case "rejected":
    case "batal":
      return "#E53935";
    default:
      return "#888";
  }
};

const ensurePickupCode = (current?: string) =>
  current || `PU-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) Alert.alert("Error", error.message);
    if (data) setOrders(data);
    setLoading(false);
  };

  const openDetail = (o: Order) => {
    setSelectedOrder(o);
    setModal(true);
  };

  const updateOrder = async (status: "accepted" | "rejected") => {
    if (!selectedOrder) return;
    setSaving(true);
    const pickupCode = ensurePickupCode(selectedOrder.pickup_code);
    const payload =
      status === "accepted"
        ? {
            status: "accepted",
            payment_status: "paid",
            pickup_code: pickupCode,
          }
        : {
            status: "rejected",
            payment_status: "rejected",
          };

    const { error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", selectedOrder.id);

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setModal(false);
    fetchData();
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {item.ref_number || `#${item.id.slice(0, 8)}`}
        </Text>
        <Text style={styles.cardSub}>
          Rp {item.total_price.toLocaleString("id-ID")}
        </Text>
        <Text style={styles.cardMeta}>
          {item.customer_name || "Customer"} -{" "}
          {new Date(item.created_at).toLocaleDateString("id-ID")}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

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
          renderItem={renderOrder}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada order.</Text>
          }
        />
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Verifikasi Pembayaran</Text>
              <Text style={styles.orderId}>
                {selectedOrder?.ref_number || selectedOrder?.id.slice(0, 8)}
              </Text>
              <Text style={styles.orderPrice}>
                Rp {selectedOrder?.total_price.toLocaleString("id-ID")}
              </Text>

              <View style={styles.infoBox}>
                <Info label="Nama" value={selectedOrder?.customer_name || "-"} />
                <Info label="Email" value={selectedOrder?.email || "-"} />
                <Info label="HP" value={selectedOrder?.phone || "-"} />
                <Info label="Metode" value="Pick up - QRIS" />
                <Info
                  label="Status bayar"
                  value={selectedOrder?.payment_status || "waiting_verification"}
                />
              </View>

              <Text style={styles.sectionTitle}>Catatan Order</Text>
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  {selectedOrder?.order_note?.trim() || "Tidak ada catatan."}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Bukti Pembayaran</Text>
              {selectedOrder?.payment_proof_url ? (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(selectedOrder.payment_proof_url || "")
                  }
                >
                  <Image
                    source={{ uri: selectedOrder.payment_proof_url }}
                    style={styles.proofImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : (
                <Text style={styles.emptyTextSmall}>Bukti belum tersedia.</Text>
              )}

              <Text style={styles.sectionTitle}>Item Order</Text>
              {(selectedOrder?.items || []).map((item, index) => (
                <View key={`${item.productId}-${index}`} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </Text>
                </View>
              ))}

              {selectedOrder?.status === "pending" ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => updateOrder("rejected")}
                    disabled={saving}
                  >
                    <Text style={styles.actionText}>Tolak</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => updateOrder("accepted")}
                    disabled={saving}
                  >
                    <Text style={styles.actionText}>
                      {saving ? "Menyimpan..." : "Accept"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pickupBox}>
                  <Text style={styles.pickupLabel}>Kode Pick Up</Text>
                  <Text style={styles.pickupCode}>
                    {selectedOrder?.pickup_code || "-"}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModal(false)}
              >
                <Text style={styles.cancelBtnText}>Tutup</Text>
              </TouchableOpacity>
            </ScrollView>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
  emptyTextSmall: { color: "#999", marginBottom: 16 },
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
    maxHeight: "88%",
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
  infoBox: {
    backgroundColor: "#F8FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    gap: 8,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  infoLabel: { fontSize: 12, color: "#777" },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    color: "#1a1a2e",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  noteBox: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  noteText: { fontSize: 13, color: "#4B5563", lineHeight: 19 },
  proofImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#eee",
    marginBottom: 18,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  itemName: { fontSize: 13, fontWeight: "700", color: "#1a1a2e" },
  itemQty: { fontSize: 12, color: "#888", marginTop: 2 },
  itemPrice: { fontSize: 12, fontWeight: "700", color: "#2D6A4F" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  rejectBtn: { backgroundColor: "#E53935" },
  acceptBtn: { backgroundColor: "#2D6A4F" },
  actionText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  pickupBox: {
    marginTop: 18,
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
  },
  pickupLabel: { fontSize: 12, color: "#2D6A4F", fontWeight: "700" },
  pickupCode: {
    fontSize: 24,
    color: "#1B4332",
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 1,
  },
  cancelBtn: { paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: "#888", fontSize: 14 },
});
