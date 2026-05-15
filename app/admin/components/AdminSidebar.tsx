import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.72;

type MenuItem = {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Overview", route: "/admin/overview", icon: "bar-chart-outline" },
  { label: "Produk", route: "/admin/products", icon: "cube-outline" },
  { label: "Kategori", route: "/admin/categories", icon: "pricetag-outline" },
  { label: "Order", route: "/admin/orders", icon: "cart-outline" },
  {
    label: "Chat",
    route: "/admin/chat",
    icon: "chatbubble-ellipses-outline",
  },
  { label: "User", route: "/admin/users", icon: "people-outline" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: string;
};

export default function AdminSidebar({ isOpen, onClose, activeRoute }: Props) {
  const { isDark, toggleTheme, colors } = useTheme();

  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const itemAnimations = React.useRef(
    MENU_ITEMS.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-30),
    })),
  ).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();

      Animated.stagger(
        80,
        itemAnimations.map((anim) =>
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
        ),
      ).start();
    } else {
      Animated.timing(translateX, {
        toValue: -SIDEBAR_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }).start();

      itemAnimations.forEach((anim) => {
        anim.opacity.setValue(0);
        anim.translateX.setValue(-30);
      });
    }
  }, [isOpen]);

  const handleLogout = () => {
    Alert.alert("Logout", "Yakin ingin keluar dari Admin Panel?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          onClose();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
        />
      </TouchableWithoutFeedback>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.surface,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.sidebarHeader}>
          <Text style={[styles.sidebarTitle, { color: colors.text }]}>
            Admin Panel
          </Text>

          <Text
            style={[styles.sidebarSubtitle, { color: colors.textSecondary }]}
          >
            Toko Juara Kelas
          </Text>
        </View>

        {/* Menu */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, index) => {
            const isActive = activeRoute === item.route;

            return (
              <Animated.View
                key={item.route}
                style={{
                  opacity: itemAnimations[index].opacity,
                  transform: [{ translateX: itemAnimations[index].translateX }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    isActive && {
                      backgroundColor: colors.accent,
                    },
                  ]}
                  onPress={() => {
                    onClose();
                    router.replace(item.route as any);
                  }}
                >
                  <Ionicons
                    name={
                      isActive
                        ? (item.icon.replace(
                            "-outline",
                            "",
                          ) as keyof typeof Ionicons.glyphMap)
                        : item.icon
                    }
                    size={20}
                    color={isActive ? "#FFFFFF" : colors.textSecondary}
                    style={styles.menuIcon}
                  />

                  <Text
                    style={[
                      styles.menuLabel,
                      {
                        color: isActive ? "#FFFFFF" : colors.textSecondary,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>

                  {isActive && (
                    <View
                      style={[
                        styles.activeIndicator,
                        {
                          backgroundColor: "#FFFFFF",
                        },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Theme Toggle */}
        <View
          style={[
            styles.themeContainer,
            {
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={styles.themeLeft}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={20}
              color={colors.text}
              style={{ marginRight: 14 }}
            />

            <Text
              style={[
                styles.themeText,
                {
                  color: colors.text,
                },
              ]}
            >
              Dark Mode
            </Text>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: "#767577",
              true: colors.accent,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              borderTopColor: colors.border,
            },
          ]}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#FF6B6B"
            style={styles.logoutIcon}
          />

          <Text
            style={[
              styles.logoutText,
              {
                color: "#FF6B6B",
              },
            ]}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    paddingTop: 60,
    paddingBottom: 40,
  },

  sidebarHeader: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  sidebarTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },

  sidebarSubtitle: {
    fontSize: 13,
  },

  menuList: {
    flex: 1,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 4,
    position: "relative",
  },

  menuIcon: {
    marginRight: 14,
  },

  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },

  activeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    position: "absolute",
    right: 0,
  },

  themeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
  },

  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  themeText: {
    fontSize: 15,
    fontWeight: "600",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },

  logoutIcon: {
    marginRight: 14,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
