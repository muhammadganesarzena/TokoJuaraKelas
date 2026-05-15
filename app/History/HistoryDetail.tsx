import { router, useLocalSearchParams } from "expo-router";
import React from "react";
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
import { useHistory } from "../context/HistoryContext";
import { useTheme } from "../context/ThemeContext";

const ORANGE = "#E8622A";
const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

const HistoryDetail: React.FC = () => {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { historyItems } = useHistory();
  const item = historyItems.find((h) => h.id === id);

  if (!item) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: colors.textMuted }}>Order not found.</Text>
      </View>
    );
  }

  const total = item.totalPrice + item.adminFee;
  const statusColor =
    item.status === "completed"
      ? "#34C759"
      : item.status === "processing"
        ? "#FF9500"
        : "#FF3B30";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* ✅ FIXED: Header warna sama dengan background, tidak ada borderBottom */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Order Detail
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: colors.card, borderLeftColor: statusColor },
          ]}
        >
          <Ionicons
            name={
              item.status === "completed"
                ? "checkmark-circle"
                : item.status === "processing"
                  ? "time"
                  : "close-circle"
            }
            size={28}
            color={statusColor}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.statusTitle, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
            <Text style={[styles.statusSub, { color: colors.textMuted }]}>
              Order #{item.refNumber.slice(-8)}
            </Text>
          </View>
        </View>

        <Text style={[styles.timeText, { color: colors.textMuted }]}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />{" "}
          {item.paymentTime}
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Shipping
        </Text>
        <View style={[styles.infoCard, { backgroundColor: colors.cardAlt }]}>
          <Text style={[styles.cardName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
            {item.email}
          </Text>
          <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
            {item.phone}
          </Text>
          <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
            {item.address}
            {item.city ? `, ${item.city}` : ""}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Order Items
        </Text>
        {item.products.map((p, idx) => (
          <View
            key={idx}
            style={[
              styles.orderItem,
              { borderBottomColor: colors.borderLight },
            ]}
          >
            <View
              style={[
                styles.orderImageBox,
                { backgroundColor: colors.surfaceAlt },
              ]}
            >
              {p.image ? (
                <Image
                  source={p.image}
                  style={styles.orderImage}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name="musical-instruments"
                  size={28}
                  color={colors.textMuted}
                />
              )}
            </View>
            <View style={styles.orderInfo}>
              <Text style={[styles.orderName, { color: colors.text }]}>
                {p.productName}
              </Text>
              <Text style={[styles.orderQty, { color: colors.textMuted }]}>
                Qty: {p.quantity}
              </Text>
            </View>
            <Text style={[styles.orderPrice, { color: colors.text }]}>
              {formatRupiah(p.price * p.quantity)}
            </Text>
          </View>
        ))}

        <Text
          style={[
            styles.sectionLabel,
            { marginTop: 24, color: colors.textMuted },
          ]}
        >
          Order Summary
        </Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.cardAlt }]}>
          {[
            ["Subtotal", item.totalPrice],
            ["Admin Fee", item.adminFee],
            ["Shipping", 0],
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
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total
            </Text>
            <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionLabel,
            { marginTop: 24, color: colors.textMuted },
          ]}
        >
          Payment Info
        </Text>
        <View style={[styles.infoCard, { backgroundColor: colors.cardAlt }]}>
          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { color: colors.textMuted }]}>
              Method
            </Text>
            <Text style={[styles.payValue, { color: colors.text }]}>
              {(item.paymentMethod || "QRIS").toUpperCase()}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { color: colors.textMuted }]}>
              Ref Number
            </Text>
            <Text style={[styles.payValue, { color: colors.text }]}>
              {item.refNumber}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { color: colors.textMuted }]}>
              Kode Pick Up
            </Text>
            <Text
              style={[
                styles.payValue,
                {
                  color:
                    item.status === "completed" && item.pickupCode
                      ? "#2D6A4F"
                      : colors.textMuted,
                },
              ]}
            >
              {item.status === "completed" && item.pickupCode
                ? item.pickupCode
                : "Menunggu verifikasi admin"}
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    // ✅ Dihapus: borderBottomWidth dan borderBottomColor
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  statusTitle: { fontSize: 16, fontWeight: "700" },
  statusSub: { fontSize: 12, marginTop: 2 },
  timeText: { fontSize: 12, marginBottom: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
    marginBottom: 20,
    gap: 3,
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
  orderImageBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  orderImage: { width: 54, height: 54 },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: "600" },
  orderQty: { fontSize: 12, marginTop: 2 },
  orderPrice: { fontSize: 14, fontWeight: "700" },
  summaryCard: { borderRadius: 12, padding: 16, gap: 10, marginBottom: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "800", color: ORANGE },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  payLabel: { fontSize: 13 },
  payValue: { fontSize: 13, fontWeight: "600" },
});

export default HistoryDetail;
