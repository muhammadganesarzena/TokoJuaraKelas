import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useHistory, type HistoryItem } from "../context/HistoryContext";
import { useTheme } from "../context/ThemeContext";

const ORANGE = "#2D6A4F";
const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type StatusFilter = "all" | "completed" | "processing" | "cancelled";

const History: React.FC = () => {
  const { colors } = useTheme();
  const { historyItems } = useHistory();
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
  }, [showFilter]);

  const filtered = historyItems
    .filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        item.products.some((p) => p.productName.toLowerCase().includes(q)) ||
        item.refNumber.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      if (sortBy === "oldest") return a.id.localeCompare(b.id);
      if (sortBy === "highest")
        return b.totalPrice + b.adminFee - (a.totalPrice + a.adminFee);
      if (sortBy === "lowest")
        return a.totalPrice + a.adminFee - (b.totalPrice + b.adminFee);
      return 0;
    });

  const statusColor = (status: HistoryItem["status"]) => {
    if (status === "completed") return "#34C759";
    if (status === "processing") return "#FF9500";
    return "#FF3B30";
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const firstProduct = item.products[0];
    const total = item.totalPrice + item.adminFee;
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
                {firstProduct?.productName || "Order"}
                {item.products.length > 1
                  ? ` +${item.products.length - 1} more`
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
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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
          borderColor: ORANGE,
          backgroundColor: ORANGE + "18",
        },
      ]}
      onPress={() => setSortBy(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: colors.textSecondary },
          sortBy === value && { color: ORANGE, fontWeight: "700" },
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
          borderColor: ORANGE,
          backgroundColor: ORANGE + "18",
        },
      ]}
      onPress={() => setStatusFilter(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: colors.textSecondary },
          statusFilter === value && { color: ORANGE, fontWeight: "700" },
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
          History
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
            placeholder="Search History."
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
            No Saved Items!
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            {"You don't have any saved items.\nGo to home and add some."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Bottom nav */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: colors.navBar,
            borderTopColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Homepage/Homepage")}
        >
          <Ionicons name="home-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time" size={24} color={ORANGE} />
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Wishlist/Wishlist")}
        >
          <Ionicons name="heart-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Profile/Profile")}
        >
          <Ionicons name="person-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

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
            Filter & Sort
          </Text>

          <Text
            style={[styles.filterSectionLabel, { color: colors.textMuted }]}
          >
            Sort By
          </Text>
          <View style={styles.filterRow}>
            <SortButton label="Newest" value="newest" />
            <SortButton label="Oldest" value="oldest" />
            <SortButton label="Highest" value="highest" />
            <SortButton label="Lowest" value="lowest" />
          </View>

          <Text
            style={[styles.filterSectionLabel, { color: colors.textMuted }]}
          >
            Status
          </Text>
          <View style={styles.filterRow}>
            <StatusButton label="All" value="all" />
            <StatusButton label="Completed" value="completed" />
            <StatusButton label="Processing" value="processing" />
            <StatusButton label="Cancelled" value="cancelled" />
          </View>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => setShowFilter(false)}
          >
            <Text style={styles.applyBtnText}>Apply</Text>
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
    backgroundColor: ORANGE,
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
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    borderTopWidth: 1,
    paddingBottom: 28,
    paddingTop: 12,
  },
  navItem: { flex: 1, alignItems: "center", gap: 4 },
  navDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: ORANGE },

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
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  applyBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});

export default History;
