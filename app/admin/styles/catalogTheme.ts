import { StyleSheet } from "react-native";
import { Colors } from "../../context/ThemeContext";

export type CatalogPalette = {
  bg: string;
  surface: string;
  surfaceMuted: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  primarySoftBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  danger: string;
  dangerSoft: string;
  dangerBorder: string;
  shadow: string;
  modalOverlay: string;
  onPrimary: string;
};

export function createCatalogPalette(
  colors: Colors,
  isDark: boolean,
): CatalogPalette {
  return {
    bg: colors.background,
    surface: colors.card,
    surfaceMuted: colors.input,
    primary: colors.accent,
    primaryDark: isDark ? colors.accent : "#1B4332",
    primarySoft: colors.accentSoft,
    primarySoftBorder: isDark ? colors.border : "#B7E4C7",
    text: colors.text,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    border: colors.border,
    danger: "#E53935",
    dangerSoft: isDark ? "rgba(229, 57, 53, 0.15)" : "#FFEBEE",
    dangerBorder: isDark ? "rgba(229, 57, 53, 0.35)" : "#FFCDD2",
    shadow: colors.shadow,
    modalOverlay: colors.modalOverlay,
    onPrimary: "#FFFFFF",
  };
}

export function createCatalogStyles(C: CatalogPalette, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
      paddingTop: 4,
    },
    toolbarSection: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
      gap: 10,
    },
    hintCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: C.primarySoft,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: C.primarySoftBorder,
    },
    hintText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? C.textSecondary : C.primaryDark,
      fontWeight: "500",
    },
    toolbarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    statPill: {
      flex: 1,
      backgroundColor: C.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: C.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      shadowColor: C.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    statIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: C.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: {
      fontSize: 18,
      fontWeight: "800",
      color: C.text,
      lineHeight: 22,
    },
    statLabel: {
      fontSize: 11,
      color: C.textMuted,
      fontWeight: "600",
      marginTop: 1,
    },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: C.primary,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 18,
      shadowColor: C.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    addBtnFull: {
      flex: 0,
      minWidth: 148,
    },
    addBtnBlock: {
      width: "100%",
    },
    addBtnText: {
      color: C.onPrimary,
      fontWeight: "800",
      fontSize: 14,
      letterSpacing: 0.2,
    },
    card: {
      backgroundColor: C.surface,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: C.border,
      overflow: "hidden",
      shadowColor: C.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    cardInner: {
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    emptyWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 56,
      paddingHorizontal: 32,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: C.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: C.text,
      textAlign: "center",
    },
    emptySub: {
      fontSize: 13,
      color: C.textMuted,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
    modalBg: {
      flex: 1,
      backgroundColor: C.modalOverlay,
      justifyContent: "flex-end",
    },
    modalBox: {
      backgroundColor: C.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 22,
      paddingTop: 10,
      paddingBottom: 16,
      maxHeight: "92%",
      borderTopWidth: 1,
      borderColor: C.border,
    },
    modalHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: C.border,
      alignSelf: "center",
      marginBottom: 14,
    },
    modalTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 4,
    },
    modalTitleIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "800",
      color: C.text,
    },
    modalSubtitle: {
      fontSize: 12,
      color: C.textMuted,
      marginBottom: 12,
      marginLeft: 50,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: C.textSecondary,
      marginBottom: 6,
      marginTop: 12,
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    input: {
      backgroundColor: C.surfaceMuted,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: C.text,
      borderWidth: 1,
      borderColor: C.border,
    },
    actionBtnOutline: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      backgroundColor: C.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: C.primarySoftBorder,
    },
    actionBtnOutlineText: {
      color: isDark ? C.primary : C.primaryDark,
      fontSize: 12,
      fontWeight: "700",
    },
    actionBtnDanger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      backgroundColor: C.dangerSoft,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: C.dangerBorder,
    },
    actionBtnDangerText: {
      color: C.danger,
      fontSize: 12,
      fontWeight: "700",
    },
    saveBtn: {
      backgroundColor: C.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 20,
      shadowColor: C.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 3,
    },
    saveBtnDisabled: { opacity: 0.65 },
    saveBtnText: { color: C.onPrimary, fontWeight: "800", fontSize: 15 },
    cancelBtn: { paddingVertical: 14, alignItems: "center" },
    cancelBtnText: { color: C.textMuted, fontSize: 14, fontWeight: "600" },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor: C.surfaceMuted,
      marginRight: 8,
      borderWidth: 1,
      borderColor: C.border,
    },
    chipActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    chipText: { fontSize: 12, color: C.textSecondary, fontWeight: "600" },
    chipTextActive: { color: C.onPrimary },
  });
}
