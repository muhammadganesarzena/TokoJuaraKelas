import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

// ── Juara Kelas — Green & White Theme ──────────────────────
const PRIMARY = "#10893E";
const PRIMARY_DARK = "#0A6E31";
const PRIMARY_SOFT = "#EAF7EF";

const TEXT_PRIMARY = "#0A2E0A";
const TEXT_SECONDARY = "#4A6B4A";

const LOTTIE_HEIGHT = height * 0.5;

// ── Background per slide ────────────────────────────────────
export const SLIDE_BACKGROUNDS = ["#F2FBF5", "#EDFAF3", "#F6FCF7", "#EEF9F2"];

// Tidak dipakai lagi di TSX (diganti SLIDE_BADGE_DATA),
// tetap diekspor agar tidak breaking jika ada file lain yang import
export const SLIDE_BADGES = [
  "Alat Tulis",
  "Perlengkapan",
  "Seragam Sekolah",
  "Belanja Sekarang",
];

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // ── Slider ──────────────────────────────────────────────
  flatList: {
    height: LOTTIE_HEIGHT,
    flexGrow: 0,
  },

  slide: {
    width,
    height: LOTTIE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Dekoratif blob
  blobTopLeft: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#A8E6C0",
    top: -60,
    left: -60,
    opacity: 0.45,
  },
  blobBottomRight: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#4FC886",
    bottom: -40,
    right: -40,
    opacity: 0.3,
  },

  lottie: {
    width: width * 0.78,
    height: LOTTIE_HEIGHT * 0.88,
    zIndex: 1,
  },

  // ── Bottom Card ──────────────────────────────────────────
  bottomContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 34,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    borderTopWidth: 1,
    borderTopColor: "#D4EDD9",
  },

  // ── Dots ─────────────────────────────────────────────────
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    gap: 7,
  },

  dot: {
    height: 7,
    borderRadius: 4,
  },

  dotActive: {
    width: 22,
    backgroundColor: PRIMARY,
  },

  dotInactive: {
    width: 7,
    backgroundColor: "#C8DEC9",
  },

  // ── Badge ─────────────────────────────────────────────────
  badgeWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#B8DFC0",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY_DARK,
    letterSpacing: 0.4,
  },

  // ── Text ──────────────────────────────────────────────────
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    textAlign: "center",
    lineHeight: 35,
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 4,
  },

  // ── Navigation Row ───────────────────────────────────────
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 20,
  },

  skipWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  skipText: {
    fontSize: 15,
    color: "#8AAE8C",
    fontWeight: "600",
  },

  nextButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 7,
  },

  // ── Get Started Button ───────────────────────────────────
  getStartedButton: {
    marginTop: "auto",
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
  },

  // Row di dalam tombol: icon + teks sejajar
  getStartedInner: {
    flexDirection: "row",
    alignItems: "center",
  },

  getStartedText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
