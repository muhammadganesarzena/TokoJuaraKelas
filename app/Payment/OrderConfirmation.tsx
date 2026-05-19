import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCart } from "../context/CartContext";
import { useHistory } from "../context/HistoryContext";
import { useTheme } from "../context/ThemeContext";
import { FREE_DELIVERY_KM } from "../../lib/delivery";

const ACCENT = "#2D6A4F";
const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

const OrderConfirmation: React.FC = () => {
  const { colors } = useTheme();
  const { cartItems, clearCart } = useCart();
  const { refreshHistory } = useHistory();
  const savedRef = useRef(false);

  const params = useLocalSearchParams<{
    orderId: string;
    refNumber: string;
    pickupCode: string;
    paymentTime: string;
    totalPrice: string;
    subtotal: string;
    shippingFee: string;
    name: string;
    email: string;
    phone: string;
    fulfillmentType: string;
    address: string;
    houseNote: string;
    distanceKm: string;
  }>();

  const subtotal = Number(params.subtotal || params.totalPrice) || 0;
  const shippingFee = Number(params.shippingFee) || 0;
  const fulfillmentType = params.fulfillmentType || "pickup";

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    refreshHistory();
  }, [refreshHistory]);

  const handleBackToShopping = () => {
    clearCart();
    router.replace("/Homepage/Homepage");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header — tanpa backgroundColor, menyatu dengan background */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Konfirmasi Pesanan
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.thankYouRow}>
          <Ionicons name="checkmark-circle" size={44} color="#34C759" />
          <View style={styles.thankYouText}>
            <Text style={[styles.thankYouTitle, { color: colors.text }]}>
              Order diterima!
            </Text>
            <Text style={[styles.thankYouSub, { color: colors.textSecondary }]}>
              Admin akan mengecek bukti pembayaran kamu.
            </Text>
          </View>
        </View>

        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {fulfillmentType === "delivery"
            ? "Setelah pembayaran diterima, admin akan memproses order dan status akan berubah menjadi sedang dikirim."
            : "Setelah pembayaran diterima, kode pick up akan aktif di history untuk ditukarkan di toko."}{" "}
          Konfirmasi dan tagihan akan dikirim ke email:{" "}
          <Text style={{ fontWeight: "700", color: colors.text }}>
            {params.email || "email kamu"}
          </Text>
          .
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Waktu pesanan: {params.paymentTime || "-"}
        </Text>

        {[{ title: fulfillmentType === "delivery" ? "Antar" : "Ambil di Toko" }].map(({ title }) => (
          <React.Fragment key={title}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              {title}
            </Text>
            <View
              style={[styles.infoCard, { backgroundColor: colors.cardAlt }]}
            >
              <Text style={[styles.cardName, { color: colors.text }]}>
                {params.name || "Pelanggan"}
              </Text>
              <Text
                style={[styles.cardDetail, { color: colors.textSecondary }]}
              >
                {params.email || "-"}
              </Text>
              <Text
                style={[styles.cardDetail, { color: colors.textSecondary }]}
              >
                {params.phone || "-"}
              </Text>
              <Text
                style={[styles.cardDetail, { color: colors.textSecondary }]}
              >
                {fulfillmentType === "delivery"
                  ? params.address || "-"
                  : "Ambil langsung di toko setelah pembayaran diverifikasi."}
              </Text>
              {fulfillmentType === "delivery" && params.houseNote ? (
                <Text
                  style={[styles.cardDetail, { color: colors.textSecondary }]}
                >
                  Catatan rumah: {params.houseNote}
                </Text>
              ) : null}
              {fulfillmentType === "delivery" && params.distanceKm ? (
                <Text
                  style={[styles.cardDetail, { color: colors.textSecondary }]}
                >
                  Jarak: {params.distanceKm} km
                </Text>
              ) : null}
            </View>
          </React.Fragment>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Item Pesanan
        </Text>
        {cartItems.map(({ product, quantity }) => (
          <View
            key={product.id}
            style={[
              styles.orderItem,
              { borderBottomColor: colors.borderLight },
            ]}
          >
            {product.image ? (
              <Image
                source={product.image}
                style={styles.orderImage}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.orderImage,
                  {
                    backgroundColor: "#f0f0f0",
                  },
                ]}
              />
            )}
            <View style={styles.orderInfo}>
              <Text style={[styles.orderName, { color: colors.text }]}>
                {product.name}
              </Text>
              <Text style={[styles.orderQty, { color: colors.textMuted }]}>
                Jml: {quantity}
              </Text>
            </View>
            <Text style={[styles.orderPrice, { color: colors.text }]}>
              {formatRupiah(product.price * quantity)}
            </Text>
          </View>
        ))}

        <Text
          style={[
            styles.sectionLabel,
            { marginTop: 24, color: colors.textMuted },
          ]}
        >
          Ringkasan Pesanan
        </Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.cardAlt }]}>
          {[
            ["Subtotal", subtotal],
            ...(fulfillmentType === "delivery"
              ? [["Ongkir", shippingFee] as const]
              : []),
          ].map(([label, val]) => (
            <View key={label as string} style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                {label}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatRupiah(val as number)}
              </Text>
            </View>
          ))}
          {fulfillmentType === "delivery" &&
          Number(params.distanceKm) > FREE_DELIVERY_KM ? (
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              Ongkir: {Math.ceil(Number(params.distanceKm))} km x Rp2.500
            </Text>
          ) : null}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total Pembayaran
            </Text>
            <Text style={styles.totalValue}>
              {formatRupiah(subtotal + shippingFee)}
            </Text>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backShopBtn, { borderColor: ACCENT }]}
          onPress={handleBackToShopping}
        >
          <Text style={[styles.backShopText, { color: ACCENT }]}>
            Kembali Belanja
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  thankYouRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  thankYouText: { flex: 1 },
  thankYouTitle: { fontSize: 20, fontWeight: "700" },
  thankYouSub: { fontSize: 13, marginTop: 2 },
  infoText: { fontSize: 13, lineHeight: 20, marginBottom: 4 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    gap: 2,
  },
  cardName: { fontSize: 15, fontWeight: "700" },
  cardDetail: { fontSize: 13 },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  orderImage: { width: 56, height: 56, borderRadius: 8 },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: "600" },
  orderQty: { fontSize: 12, marginTop: 2 },
  orderPrice: { fontSize: 14, fontWeight: "700" },
  summaryCard: { borderRadius: 12, padding: 16, gap: 10 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1, marginVertical: 6 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "800", color: ACCENT },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
  },
  backShopBtn: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  backShopText: { fontSize: 16, fontWeight: "700" },
});

export default OrderConfirmation;
