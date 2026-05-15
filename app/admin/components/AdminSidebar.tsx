import { router } from "expo-router";
import React from "react";
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.72;

type MenuItem = {
  label: string;
  route: string;
  icon: string;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Overview", route: "/admin/overview", icon: "📊" },
  { label: "Produk", route: "/admin/products", icon: "📦" },
  { label: "Kategori", route: "/admin/categories", icon: "🏷️" },
  { label: "Order", route: "/admin/orders", icon: "🛒" },
  { label: "User", route: "/admin/users", icon: "👥" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: string;
};

export default function AdminSidebar({ isOpen, onClose, activeRoute }: Props) {
  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start();
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
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        {/* Header */}
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Admin Panel</Text>
          <Text style={styles.sidebarSubtitle}>Toko Juara Kelas</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => {
                  onClose();
                  router.replace(item.route as any);
                }}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text
                  style={[styles.menuLabel, isActive && styles.menuLabelActive]}
                >
                  {item.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000055",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#1B4332",
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
    color: "#FFFFFF",
    marginBottom: 4,
  },
  sidebarSubtitle: {
    fontSize: 13,
    color: "#A5D6A7",
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
    borderRadius: 0,
    position: "relative",
  },
  menuItemActive: {
    backgroundColor: "#2D6A4F",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#A5D6A7",
    flex: 1,
  },
  menuLabelActive: {
    color: "#FFFFFF",
  },
  activeIndicator: {
    width: 4,
    height: 24,
    backgroundColor: "#52B788",
    borderRadius: 2,
    position: "absolute",
    right: 0,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#2D6A4F",
    marginTop: 8,
  },
  logoutIcon: { fontSize: 20, marginRight: 14 },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF8A80",
  },
});
