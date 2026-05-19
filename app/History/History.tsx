import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRefreshControl } from "../hooks/useRefreshControl";
import Ionicons from "react-native-vector-icons/Ionicons";
import UserBottomNav from "../components/UserBottomNav";
import { useHistory, type HistoryItem } from "../context/HistoryContext";
import { useTheme } from "../context/ThemeContext";

const ACCENT = "#2D6A4F";
const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type StatusFilter =
  | "all"
  | "completed"
  | "processing"
  | "delivering"
  | "cancelled";

const History: React.FC = () => {
  const { colors } = useTheme();
  const { historyItems, refreshHistory, loadingHistory } = useHistory();
  const { refreshing, onRefresh } = useRefreshControl(refreshHistory);

  useFocusEffect(
    useCallback(() => {
      void refreshHistory();
    }, [refreshHistory]),
  );

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const sheetAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (showFilter) {
      Animated.spring(sheetAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }).start();
    } else {
      sheetAnim.setValue(400);
    }
  }, [showFilter, sheetAnim]);

  const orderGrandTotal = (item: HistoryItem) =>
    item.totalPrice + (item.shippingFee || 0);

  const filtered = historyItems
    .filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        item.products.some((p) => p.productName.toLowerCase().includes(q)) ||
        item.refNumber.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" ||
        item.status === statusFilter ||
        (statusFilter === "processing" &&
          (item.status === "processing" || item.status === "ready_for_pickup"));
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      if (sortBy === "oldest") return a.id.localeCompare(b.id);
      if (sortBy === "highest")
        return orderGrandTotal(b) - orderGrandTotal(a);
      if (sortBy === "lowest")
        return orderGrandTotal(a) - orderGrandTotal(b);
      return 0;
    });

  const statusColor = (status: HistoryItem["status"]) => {
    if (status === "completed") return "#34C759";
    if (status === "delivering") return "#7B1FA2";
    if (status === "ready_for_pickup") return "#F59E0B";
    if (status === "processing") return "#2D6A4F";
    return "#FF3B30";
  };

  const statusLabel = (status: HistoryItem["status"]) => {
    if (status === "completed") return "Selesai";
    if (status === "delivering") return "Sedang dikirim";
    if (status === "ready_for_pickup") return "Siap diambil";
    if (status === "processing") return "Menunggu verifikasi";
    return "Dibatalkan";
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const firstProduct = item.products[0];
    const total = orderGrandTotal(item);
    const shortRef = item.refNumber.slice(-6).toUpperCase();
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardInner}>
          <View
            style={[styles.imageBox, { backgroundColor: colors.surfaceAlt }]}
          >
            {firstProduct?.image ? (
              <Image
                source={firstProduct.image}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons
                name="musical-instruments"
                size={36}
                color={colors.textMuted}
              />
            )}
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardTopRow}>
              <Text
                style={[styles.productName, { color: colors.text }]}
                numberOfLines={1}
              >
                {firstProduct?.productName || "Pesanan"}
                {item.products.length > 1
                  ? ` +${item.products.length - 1} lainnya`
                  : ""}
              </Text>
              <Text style={[styles.refText, { color: colors.textMuted }]}>
                {shortRef}
              </Text>
            </View>
            <Text style={[styles.priceText, { color: colors.text }]}>
              {formatRupiah(total)}
            </Text>
            <View style={styles.cardBottomRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor(item.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColor(item.status) },
                  ]}
                >
                  {statusLabel(item.status)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() =>
                  router.push({
                    pathname: "/History/HistoryDetail",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.detailBtnText}>Detail</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const SortButton = ({
    label,
    value,
  }: {
    label: string;
    value: SortOption;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { borderColor: colors.border, backgroundColor: colors.card },
        sortBy === value && {
          borderColor: ACCENT,
          backgroundColor: "#2D6A4F18",
        },
      ]}
      onPress={() => setSortBy(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: colors.textSecondary },
          sortBy === value && { color: ACCENT, fontWeight: "700" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatusButton = ({
    label,
    value,
  }: {
    label: string;
    value: StatusFilter;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { borderColor: colors.border, backgroundColor: colors.card },
        statusFilter === value && {
          borderColor: ACCENT,
          backgroundColor: "#2D6A4F18",
        },
      ]}
      onPress={() => setStatusFilter(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: colors.textSecondary },
          statusFilter === value && { color: ACCENT, fontWeight: "700" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Riwayat
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar + filter button sejajar */}
      <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
        <View
          style={[styles.searchBox, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari riwayat pesanan..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterIconBtn, { backgroundColor: colors.text }]}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="options" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Belum Ada Pesanan!
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            {"Kamu belum punya pesanan.\nMulai belanja dari beranda."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loadingHistory}
              onRefresh={onRefresh}
              colors={[ACCENT]}
              tintColor={ACCENT}
            />
          }
        />
      )}

      <UserBottomNav active="history" />

      <Modal
        visible={showFilter}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilter(false)}
        />

        <Animated.View
          style={[
            styles.filterSheet,
            { backgroundColor: colors.surface },
            { transform: [{ translateY: sheetAnim }] },
          ]}
        >
          <View
            style={[styles.filterHandle, { backgroundColor: colors.border }]}
          />
          <Text style={[styles.filterTitle, { color: colors.text }]}>
            Filter & Urutkan
          </Text>

          <Text
            style={[styles.filterSectionLabel, { color: colors.textMuted }]}
          >
            Urutkan
          </Text>
          <View style={styles.filterRow}>
            <SortButton label="Terbaru" value="newest" />
            <SortButton label="Terlama" value="oldest" />
            <SortButton label="Tertinggi" value="highest" />
            <SortButton label="Terendah" value="lowest" />
          </View>

          <Text
            style={[styles.filterSectionLabel, { color: colors.textMuted }]}
          >
            Status
          </Text>
          <View style={styles.filterRow}>
            <StatusButton label="Semua" value="all" />
            <StatusButton label="Selesai" value="completed" />
            <StatusButton label="Diproses" value="processing" />
            <StatusButton label="Dikirim" value="delivering" />
            <StatusButton label="Dibatalkan" value="cancelled" />
          </View>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => setShowFilter(false)}
          >
            <Text style={styles.applyBtnText}>Terapkan</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
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
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 },
  card: { borderRadius: 16, marginBottom: 14, overflow: "hidden" },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: { width: 72, height: 72 },
  cardInfo: { flex: 1 },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: { fontSize: 14, fontWeight: "600", flex: 1 },
  refText: { fontSize: 12, marginLeft: 8 },
  priceText: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  detailBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailBtnText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  filterSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  filterHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  filterTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  filterSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterChipText: { fontSize: 13, fontWeight: "500" },
  applyBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  applyBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});

export default History;
