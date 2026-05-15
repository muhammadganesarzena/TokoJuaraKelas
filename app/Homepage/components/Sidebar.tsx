import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.72;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Home", icon: "home-outline", route: "/Homepage/Homepage" },
  { label: "Wishlist", icon: "heart-outline", route: "/Wishlist/Wishlist" },
  { label: "History", icon: "time-outline", route: "/History/History" },
  {
    label: "Chat Admin",
    icon: "chatbubble-ellipses-outline",
    route: "/chat",
  },
  { label: "Profile", icon: "person-outline", route: "/Profile/Profile" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(NAV_ITEMS.map(() => new Animated.Value(0))).current;
  const themeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      logoAnim.setValue(0);
      itemAnims.forEach((a) => a.setValue(0));
      themeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.stagger(55, [
          Animated.spring(logoAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          }),
          ...itemAnims.map((a) =>
            Animated.spring(a, {
              toValue: 1,
              useNativeDriver: true,
              tension: 120,
              friction: 8,
            }),
          ),
          Animated.spring(themeAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dx < -10,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) slideAnim.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handleNav = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 220);
  };

  const animatedItem = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-28, 0],
        }),
      },
    ],
  });

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayAnim }]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sidebar Panel */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.shadow,
            transform: [{ translateX: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[styles.logoFloating, animatedItem(logoAnim)]}
          pointerEvents="none"
        >
          <Image
            source={
              isDark
                ? require("../../../assets/images/SplashScreen/GuitarLogoWhite.png")
                : require("../../../assets/images/SplashScreen/GuitarLogoBlack.png")
            }
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.topSpacer} />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Nav Items */}
        <View style={styles.navSection}>
          {NAV_ITEMS.map((item, i) => (
            <Animated.View key={item.label} style={animatedItem(itemAnims[i])}>
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(item.route)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.navIconBox,
                    { backgroundColor: colors.accentSoft },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={colors.accent}
                  />
                </View>
                <Text style={[styles.navLabel, { color: colors.text }]}>
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Dark Mode Toggle */}
        <Animated.View style={[styles.themeRow, animatedItem(themeAnim)]}>
          <View
            style={[styles.navIconBox, { backgroundColor: colors.accentSoft }]}
          >
            <Ionicons
              name={isDark ? "moon" : "sunny-outline"}
              size={20}
              color={colors.accent}
            />
          </View>
          <Text style={[styles.navLabel, { color: colors.text }]}>
            {isDark ? "Dark Mode" : "Light Mode"}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#CCCCCC", true: colors.accent }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#CCCCCC"
          />
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Juara Kelas
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: SCREEN_HEIGHT,
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 52,
    overflow: "hidden",
  },
  logoFloating: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) - 10 : 30,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 0,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  topSpacer: {
    height: 90,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 6,
  },
  navSection: {
    paddingVertical: 6,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginHorizontal: 10,
    borderRadius: 14,
    marginVertical: 2,
  },
  navIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginHorizontal: 10,
    borderRadius: 14,
    marginVertical: 2,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
});

export default Sidebar;
