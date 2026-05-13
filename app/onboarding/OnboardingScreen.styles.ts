import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

const ORANGE = "#E8622A";
const IMAGE_HEIGHT = height * 0.58;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // ── Slider ──────────────────────────────────────────────
  flatList: {
    height: IMAGE_HEIGHT,
    flexGrow: 0,
  },
  slide: {
    width,
    height: IMAGE_HEIGHT,
  },
  image: {
    width: "100%",
    height: "100%",
  },

  // ── Bottom Content ───────────────────────────────────────
  bottomContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32,
  },

  // ── Dots ─────────────────────────────────────────────────
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: ORANGE,
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#D9D9D9",
  },

  // ── Text ──────────────────────────────────────────────────
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    color: "#888888",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Navigation Row (slide 1-3) ────────────────────────────
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 20,
  },
  skipText: {
    fontSize: 16,
    color: "#AAAAAA",
    fontWeight: "500",
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  nextArrow: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 36,
    marginLeft: 3,
  },

  // ── Get Started Button (slide 4) ──────────────────────────
  getStartedButton: {
    marginTop: "auto",
    paddingTop: 20,
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
