import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRefreshControl } from "../hooks/useRefreshControl";
import { formatOrderStatus } from "../../lib/delivery";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import { useAdminTheme } from "./hooks/useAdminTheme";
import { Colors } from "../context/ThemeContext";

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
  shipping_fee?: number;
  status: string;
  payment_status?: string;
  payment_proof_url?: string;
  payment_method?: string;
  fulfillment_type?: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  house_note?: string | null;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  delivery_distance_km?: number | null;
  order_note?: string | null;
  items?: OrderItem[];
  created_at: string;
};

const statusColor = (s: string) => {
  switch (s) {
    case "pending":
      return "#2D6A4F";
    case "accepted":
    case "selesai":
      return "#2D6A4F";
    case "dikirim":
    case "delivering":
      return "#7B1FA2";
    case "rejected":
    case "batal":
      return "#E53935";
    default:
      return "#888";
  }
};

const fulfillmentLabel = (type?: string) =>
  type === "delivery" ? "Antar" : "Pick Up";

const ensurePickupCode = (current?: string) =>
  current || `PU-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

export default function Orders() {
  const { colors, base } = useAdminTheme();
  const styles = useMemo(() => createOrderStyles(colors), [colors]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) Alert.alert("Kesalahan", error.message);
    if (data) setOrders(data);
    if (!silent) setLoading(false);
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await fetchData();
  });

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      void fetchData(true);
    }, [fetchData]),
  );

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void fetchData(true);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const openDetail = (o: Order) => {
    setSelectedOrder(o);
    setModal(true);
  };

  const confirmPickup = () => {
    if (!selectedOrder) return;

    Alert.alert(
      "Konfirmasi Pick Up",
      "Yakin barang sudah diambil customer di toko?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, sudah diambil",
          onPress: async () => {
            setSaving(true);
            const { error } = await supabase
              .from("orders")
              .update({ status: "selesai" })
              .eq("id", selectedOrder.id);

            setSaving(false);
            if (error) {
              Alert.alert("Kesalahan", error.message);
              return;
            }

            Alert.alert("Berhasil", "Pesanan ambil di toko ditandai selesai.");
            setModal(false);
            fetchData();
          },
        },
      ],
    );
  };

  const updateOrder = async (status: "accepted" | "rejected") => {
    if (!selectedOrder) return;
    setSaving(true);
    const isDelivery = selectedOrder.fulfillment_type === "delivery";
    const pickupCode = ensurePickupCode(selectedOrder.pickup_code);
    const payload =
      status === "accepted"
        ? isDelivery
          ? {
              status: "dikirim",
              payment_status: "paid",
            }
          : {
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
      Alert.alert("Kesalahan", error.message);
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
          {fulfillmentLabel(item.fulfillment_type)} ·{" "}
          {item.customer_name || "Pelanggan"}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString("id-ID")}
        </Text>
      </View>
      <View style={styles.badgeCol}>
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColor(item.status) },
          ]}
        >
          <Text style={styles.badgeText}>
            {formatOrderStatus(item.status, item.fulfillment_type)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={base.container}>
      <AdminHeader title="Pesanan" onMenuPress={() => setSidebarOpen(true)} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={base.listContent}
          renderItem={renderOrder}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={onRefresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
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
                <Info styles={styles} label="Nama" value={selectedOrder?.customer_name || "-"} />
                <Info styles={styles} label="Email" value={selectedOrder?.email || "-"} />
                <Info styles={styles} label="HP" value={selectedOrder?.phone || "-"} />
                <Info
                  styles={styles}
                  label="Metode"
                  value={
                    selectedOrder?.fulfillment_type === "delivery"
                      ? "Antar - QRIS"
                      : "Ambil di toko - QRIS"
                  }
                />
                <Info
                  styles={styles}
                  label="Status bayar"
                  value={selectedOrder?.payment_status || "waiting_verification"}
                />
                {selectedOrder?.fulfillment_type === "delivery" ? (
                  <>
                    <Info
                      styles={styles}
                      label="Alamat"
                      value={selectedOrder.address || "-"}
                    />
                    <Info
                      styles={styles}
                      label="Catatan rumah"
                      value={selectedOrder.house_note || "-"}
                    />
                    <Info
                      styles={styles}
                      label="Jarak"
                      value={
                        selectedOrder.delivery_distance_km
                          ? `${selectedOrder.delivery_distance_km} km`
                          : "-"
                      }
                    />
                  </>
                ) : null}
              </View>

              {selectedOrder?.fulfillment_type === "delivery" &&
              selectedOrder.delivery_lat &&
              selectedOrder.delivery_lng ? (
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps?q=${selectedOrder.delivery_lat},${selectedOrder.delivery_lng}`,
                    )
                  }
                >
                  <Text style={styles.mapBtnText}>Lihat Lokasi Pelanggan</Text>
                </TouchableOpacity>
              ) : null}

              <Text style={styles.sectionTitle}>Catatan Pesanan</Text>
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

              <Text style={styles.sectionTitle}>Item Pesanan</Text>
              {(selectedOrder?.items || []).map((item, index) => (
                <View key={`${item.productId}-${index}`} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemQty}>Jml: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
              <View style={styles.infoBox}>
                <Info
                  styles={styles}
                  label="Subtotal"
                  value={`Rp ${Number(selectedOrder?.subtotal || 0).toLocaleString("id-ID")}`}
                />
                <Info
                  styles={styles}
                  label="Ongkir"
                  value={`Rp ${Number(selectedOrder?.shipping_fee || 0).toLocaleString("id-ID")}`}
                />
                <Info
                  styles={styles}
                  label="Total"
                  value={`Rp ${Number(selectedOrder?.total_price || 0).toLocaleString("id-ID")}`}
                />
              </View>

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
                      {saving
                        ? "Menyimpan..."
                        : selectedOrder.fulfillment_type === "delivery"
                          ? "Terima & Kirim"
                          : "Terima"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : selectedOrder?.fulfillment_type !== "delivery" &&
                selectedOrder?.status === "accepted" ? (
                <View style={styles.pickupActions}>
                  <View style={styles.pickupBox}>
                    <Text style={styles.pickupLabel}>Kode Ambil di Toko</Text>
                    <Text style={styles.pickupCode}>
                      {selectedOrder.pickup_code || "-"}
                    </Text>
                    <Text style={styles.pickupHint}>
                      Berikan kode ini saat customer mengambil barang.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.confirmPickupBtn, saving && { opacity: 0.7 }]}
                    onPress={confirmPickup}
                    disabled={saving}
                  >
                    <Text style={styles.confirmPickupText}>
                      {saving ? "Menyimpan..." : "Konfirmasi Sudah Diambil"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pickupBox}>
                  <Text style={styles.pickupLabel}>
                    {selectedOrder?.fulfillment_type === "delivery"
                      ? "Status Antar"
                      : "Status Ambil di Toko"}
                  </Text>
                  <Text style={styles.pickupCode}>
                    {formatOrderStatus(
                      selectedOrder?.status || "",
                      selectedOrder?.fulfillment_type,
                    )}
                  </Text>
                  {selectedOrder?.fulfillment_type !== "delivery" &&
                  selectedOrder?.pickup_code ? (
                    <Text style={[styles.pickupHint, { marginTop: 8 }]}>
                      Kode: {selectedOrder.pickup_code}
                    </Text>
                  ) : null}
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

function Info({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createOrderStyles>;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const createOrderStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
    cardSub: { fontSize: 12, color: colors.accent, marginTop: 2 },
    cardMeta: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: "600",
    },
    cardDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    badgeCol: { alignItems: "flex-end", gap: 6 },
    badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 40,
    },
    emptyTextSmall: { color: colors.textMuted, marginBottom: 16 },
    modalBg: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "flex-end",
    },
    modalBox: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: "88%",
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
    },
    orderId: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    orderPrice: { fontSize: 13, color: colors.accent, marginBottom: 16 },
    infoBox: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      padding: 14,
      marginBottom: 18,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    infoLabel: { fontSize: 12, color: colors.textMuted },
    infoValue: {
      flex: 1,
      textAlign: "right",
      fontSize: 12,
      color: colors.text,
      fontWeight: "700",
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 10,
      textTransform: "uppercase",
    },
    noteBox: {
      backgroundColor: colors.accentSoft,
      borderRadius: 12,
      padding: 14,
      marginBottom: 18,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    noteText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
    mapBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: "center",
      marginBottom: 18,
    },
    mapBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
    proofImage: {
      width: "100%",
      height: 220,
      borderRadius: 12,
      backgroundColor: colors.input,
      marginBottom: 18,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 10,
    },
    itemName: { fontSize: 13, fontWeight: "700", color: colors.text },
    itemQty: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    itemPrice: { fontSize: 12, fontWeight: "700", color: colors.accent },
    actionRow: { flexDirection: "row", gap: 10, marginTop: 18 },
    actionBtn: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    rejectBtn: { backgroundColor: "#E53935" },
    acceptBtn: { backgroundColor: colors.accent },
    actionText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    pickupActions: { marginTop: 18, gap: 12 },
    pickupBox: {
      borderRadius: 12,
      padding: 16,
      backgroundColor: colors.accentSoft,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickupLabel: { fontSize: 12, color: colors.accent, fontWeight: "700" },
    pickupCode: {
      fontSize: 24,
      color: colors.text,
      fontWeight: "900",
      marginTop: 4,
      letterSpacing: 1,
    },
    pickupHint: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 17,
    },
    confirmPickupBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    confirmPickupText: { color: "#fff", fontSize: 14, fontWeight: "800" },
    cancelBtn: { paddingVertical: 14, alignItems: "center" },
    cancelBtnText: { color: colors.textMuted, fontSize: 14 },
  });
