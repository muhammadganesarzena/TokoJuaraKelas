import { StyleSheet } from "react-native";
import type { Colors } from "../context/ThemeContext";

const ORANGE = "#2D6A4F";

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 52,
      paddingBottom: 16,
      // Tidak ada backgroundColor — menyatu dengan background
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text },

    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },

    scrollView: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      gap: 16,
    },

    cartCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      gap: 12,
    },
    cartImageWrapper: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
    },
    cartImage: { width: 64, height: 64 },
    cartInfo: { flex: 1 },
    cartName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    cartPrice: { fontSize: 15, fontWeight: "700", color: colors.text },

    qtyControl: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: ORANGE,
      borderRadius: 10,
      overflow: "hidden",
    },
    qtyBtn: {
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    qtyBtnText: { fontSize: 18, color: ORANGE, fontWeight: "600" },
    qtyValue: {
      paddingHorizontal: 10,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },

    bottomBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 36,
      gap: 16,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: { fontSize: 16, fontWeight: "600", color: colors.text },
    totalValue: { fontSize: 20, fontWeight: "800", color: ORANGE },
    buyNowBtn: {
      backgroundColor: ORANGE,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
    },
    buyNowText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  });
