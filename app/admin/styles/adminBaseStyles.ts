import { StyleSheet } from "react-native";
import { Colors } from "../../context/ThemeContext";

export function createAdminBaseStyles(colors: Colors, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    cardSub: {
      fontSize: 12,
      color: colors.accent,
      marginTop: 2,
    },
    cardMeta: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 40,
      fontSize: 14,
    },
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
    inputLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: colors.input,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveBtn: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 16,
    },
    saveBtnText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
    cancelBtn: {
      paddingVertical: 14,
      alignItems: "center",
    },
    cancelBtnText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    editBtn: {
      backgroundColor: isDark ? colors.accentSoft : "#E8F5E9",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? colors.border : "#B7E4C7",
    },
    editBtnText: {
      color: isDark ? colors.accent : "#1B4332",
      fontSize: 12,
      fontWeight: "700",
    },
    deleteBtn: {
      backgroundColor: isDark ? "rgba(229, 57, 53, 0.15)" : "#FFEBEE",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(229, 57, 53, 0.35)" : "#FFCDD2",
    },
    deleteBtnText: {
      color: "#E53935",
      fontSize: 12,
      fontWeight: "700",
    },
    badge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "700",
    },
    sectionMuted: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
}
