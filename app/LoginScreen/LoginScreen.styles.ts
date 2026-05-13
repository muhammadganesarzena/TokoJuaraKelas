import { Dimensions, StyleSheet } from "react-native";

const { height } = Dimensions.get("window");

const GREEN_DARK = "#1B4332";
const GREEN_MID = "#2D6A4F";
const GREEN_ACCENT = "#52B788";
const WHITE = "#FFFFFF";

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    // ── Layout utama ──
    flex: {
      flex: 1,
      backgroundColor: GREEN_DARK,
    },
    container: {
      flex: 1,
      backgroundColor: GREEN_DARK,
    },

    // ── Bagian atas (hijau) ──
    topSection: {
      height: height * 0.38,
      backgroundColor: GREEN_DARK,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 40,
    },
    logo: {
      width: 100,
      height: 100,
      tintColor: WHITE,
    },
    welcomeText: {
      fontSize: 26,
      fontWeight: "800",
      color: WHITE,
      marginTop: 16,
      letterSpacing: 0.3,
    },
    welcomeSub: {
      fontSize: 13,
      color: GREEN_ACCENT,
      marginTop: 4,
      letterSpacing: 0.5,
    },

    // ── Bagian bawah (putih/card) ──
    bottomSection: {
      flex: 1,
      backgroundColor: WHITE,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 28,
      paddingTop: 36,
      paddingBottom: 32,
    },
    bottomSectionDark: {
      backgroundColor: "#111111",
    },

    // ── Label & Input underline ──
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#AAAAAA" : "#888888",
      marginBottom: 4,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1.5,
      borderBottomColor: isDark ? "#333333" : "#E0E0E0",
      marginBottom: 24,
      paddingBottom: 8,
      backgroundColor: "transparent",
    },
    inputError: {
      borderBottomColor: "#E53935",
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1A1A1A",
      paddingVertical: 0,
    },
    eyeIcon: {
      width: 22,
      height: 22,
      tintColor: isDark ? "#666" : "#AAAAAA",
    },

    // ── Title dalam card ──
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#1A1A1A",
      marginBottom: 28,
    },

    // ── Tombol Sign In ──
    signInButton: {
      backgroundColor: GREEN_MID,
      borderRadius: 14,
      paddingVertical: 17,
      alignItems: "center",
      shadowColor: GREEN_DARK,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
      marginTop: 8,
      marginBottom: 24,
    },
    signInText: {
      color: WHITE,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },

    // ── Other way ──
    otherWayText: {
      fontSize: 13,
      color: isDark ? "#666666" : "#AAAAAA",
      textAlign: "center",
      marginBottom: 16,
    },
    socialRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 32,
    },
    socialButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? "#1E1E1E" : "#F4F4F4",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "#333333" : "#EEEEEE",
    },
    socialIcon: {
      width: 28,
      height: 28,
    },

    // ── Register row ──
    registerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    registerText: {
      fontSize: 14,
      color: isDark ? "#888888" : "#888888",
    },
    registerLink: {
      fontSize: 14,
      color: GREEN_MID,
      fontWeight: "700",
    },

    // ── Unused tapi tetap ada biar tidak error ──
    inputFlex: { flex: 1 },
    eyeButton: { paddingLeft: 10 },
    errorText: { fontSize: 12, color: "#E53935", marginTop: 4 },
    forgotContainer: { alignSelf: "flex-end", marginTop: 4, marginBottom: 24 },
    forgotText: { fontSize: 13, color: isDark ? "#AAAAAA" : "#888888" },
    socialButtonPressed: {},
  });
