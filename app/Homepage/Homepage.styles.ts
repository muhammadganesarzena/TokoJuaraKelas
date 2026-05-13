import { Dimensions, StyleSheet } from "react-native";
import type { Colors } from "../context/ThemeContext";

const GREEN = "#2D6A4F";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 28 * 2 - 12) / 2;

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 90 },

    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 52,
      paddingBottom: 12,
      backgroundColor: colors.surface,
    },
    headerRight: {
      flexDirection: "row",
      gap: 8,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    headerIconPressed: {
      backgroundColor: colors.surfaceAlt,
    },

    // Cart Badge
    cartBadge: {
      position: "absolute",
      top: 2,
      right: 2,
      backgroundColor: "#FF3B30",
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    cartBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
    },

    // Feed Title
    feedTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 14,
      backgroundColor: colors.surface,
    },

    // Sections
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 12,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    sectionSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    viewAll: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: "500",
    },
    horizontalList: {
      paddingHorizontal: 20,
      gap: 12,
    },

    // Recommended
    recommendCard: {
      width: 140,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
    },
    recommendImage: {
      width: "100%",
      height: 120,
      marginBottom: 8,
    },
    recommendPrice: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    recommendName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },

    // Brand
    brandCard: {
      width: 90,
      height: 56,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    brandLogo: { width: 48, height: 28 },
    brandName: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: "600",
    },

    // Products Grid
    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      gap: 25,
      paddingTop: 35,
    },
    productWrapper: { width: CARD_WIDTH },
    productCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      position: "relative",
    },
    heartButton: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 10,
    },
    productImage: {
      width: "100%",
      height: 130,
      marginBottom: 10,
      marginTop: 4,
    },
    productPrice: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    productName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },

    // Bottom Nav
    bottomNav: {
      flexDirection: "row",
      backgroundColor: colors.navBar,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingBottom: 24,
      paddingTop: 12,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    navItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    navDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: GREEN,
      marginTop: 3,
    },
  });
