import { StyleSheet } from "react-native";
import type { Colors } from "../context/ThemeContext";

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 52,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    backCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    title: { fontSize: 20, fontWeight: "700", color: colors.text },

    card: {
      flex: 1,
      maxWidth: "50%",
      margin: 6,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 12,
      alignItems: "center",
      position: "relative",
      overflow: "visible",
      elevation: 2,
    },
    image: { width: 120, height: 150, resizeMode: "contain" },
    price: {
      fontWeight: "bold",
      marginTop: 10,
      fontSize: 14,
      color: colors.text,
    },
    name: {
      color: colors.textSecondary,
      marginBottom: 10,
      textAlign: "center",
      fontSize: 13,
    },

    button: {
      backgroundColor: "#2D6A4F",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonAdded: { backgroundColor: "#4CAF50" },
    buttonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 13,
      marginLeft: 6,
    },

    heart: {
      position: "absolute",
      top: -8,
      right: -8,
      zIndex: 99,
      backgroundColor: colors.card,
      padding: 8,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },

    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 20,
      color: colors.text,
    },
    emptyDesc: { textAlign: "center", color: colors.textMuted, marginTop: 10 },

    bottomNav: {
      flexDirection: "row",
      backgroundColor: colors.navBar,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingBottom: 28,
      paddingTop: 12,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
    navDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: "#2D6A4F",
      marginTop: 3,
    },
  });
