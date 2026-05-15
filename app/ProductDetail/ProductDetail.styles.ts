import { Dimensions, StyleSheet } from "react-native";
import type { Colors } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const ORANGE = "#E8622A";

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    // ── Root ──────────────────────────────────────────────────
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 110,
    },

    // ── Not Found ─────────────────────────────────────────────
    notFound: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    notFoundText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    backLink: {
      fontSize: 15,
      color: ORANGE,
      fontWeight: "600",
    },

    // ── Hero ──────────────────────────────────────────────────
    heroArea: {
      width: "100%",
      height: 400,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    backBtn: {
      position: "absolute",
      top: 52,
      left: 20,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    wishBtn: {
      position: "absolute",
      top: 52,
      right: 20,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    heroImage: {
      width: width * 0.62,
      height: 320,
    },

    // ── Thumbnails ────────────────────────────────────────────
    thumbRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 4,
      gap: 10,
    },
    thumbCard: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    thumbCardActive: {
      borderColor: ORANGE,
      backgroundColor: ORANGE + "18",
    },
    thumbImage: {
      width: 50,
      height: 50,
    },

    // ── Info Section ──────────────────────────────────────────
    infoSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    nameRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    productName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textSecondary,
      flex: 1,
      marginRight: 12,
    },
    stockText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      marginTop: 2,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    price: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ratingValue: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    reviewCount: {
      fontSize: 13,
      color: colors.textMuted,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
    },

    // ── Bottom Bar ────────────────────────────────────────────
    bottomBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 34,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },

    // Default Button
    addToCartBtn: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ORANGE,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    addToCartText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginLeft: 6,
    },

    // State: Added
    addToCartBtnAdded: {
      backgroundColor: "#4CAF50",
      borderColor: "#4CAF50",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    addToCartTextAdded: {
      color: "#FFFFFF",
    },

    // Buy Now
    buyNowBtn: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      backgroundColor: ORANGE,
      alignItems: "center",
      justifyContent: "center",
    },
    buyNowBtnDisabled: {
      opacity: 0.7,
    },
    buyNowText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
