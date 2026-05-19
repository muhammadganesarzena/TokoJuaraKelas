import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { clearAdminSession } from "../../lib/adminSession";
import { supabase } from "../../lib/supabase";
import UserBottomNav from "../components/UserBottomNav";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const ACCENT = "#2D6A4F";

type OrderCounts = {
  proses: number;
  dikirim: number;
  selesai: number;
};

const countOrderStatus = (status?: string | null) => {
  const normalized = (status || "").toLowerCase();

  if (["completed", "selesai"].includes(normalized)) {
    return "selesai";
  }

  if (normalized === "accepted") {
    return "proses";
  }

  if (["dikirim", "shipped", "delivering"].includes(normalized)) {
    return "dikirim";
  }

  if (["pending", "processing", "proses"].includes(normalized)) {
    return "proses";
  }

  return null;
};

export default function Profile() {
  const router = useRouter();
  const { profile, loadingProfile } = useProfile();
  const { colors } = useTheme();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [orderCounts, setOrderCounts] = useState<OrderCounts>({
    proses: 0,
    dikirim: 0,
    selesai: 0,
  });

  useEffect(() => {
    const fetchOrderCounts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("user_id", user.id);

      const counts = { proses: 0, dikirim: 0, selesai: 0 };
      (data || []).forEach((order: any) => {
        const countedStatus = countOrderStatus(order.status);
        if (countedStatus) counts[countedStatus] += 1;
      });

      setOrderCounts(counts);
    };

    fetchOrderCounts();
  }, []);

  if (loadingProfile) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.border }]}
            onPress={() => router.push("/Homepage/Homepage")}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: profile.image || DEFAULT_IMAGE }}
            style={styles.avatar}
          />
        </View>

        {/* Info */}
        <Text style={[styles.name, { color: colors.text }]}>
          {profile.name}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {profile.email}
        </Text>
        <Text style={[styles.nim, { color: colors.textSecondary }]}>
          {profile.nim}
        </Text>

        {/* Order Monitor */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.monitorHeader}>
            <Text style={[styles.monitorTitle, { color: colors.text }]}>
              Monitoring Pesanan
            </Text>
            <TouchableOpacity onPress={() => router.push("/History/History")}>
              <Text style={styles.monitorLink}>Lihat semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusGrid}>
            <OrderStatus
              label="Proses"
              count={orderCounts.proses}
              icon="reload-circle-outline"
              color="#1976D2"
            />
            <OrderStatus
              label="Dikirim"
              count={orderCounts.dikirim}
              icon="bicycle-outline"
              color="#7B1FA2"
            />
            <OrderStatus
              label="Selesai"
              count={orderCounts.selesai}
              icon="checkmark-circle-outline"
              color="#2D6A4F"
            />
          </View>
        </View>

        {/* Logout Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => setLogoutVisible(true)}
        >
          <View style={styles.menuItem}>
            <MaterialIcons
              name="logout"
              size={20}
              color={colors.text}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: colors.text }]}>
              Keluar
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <UserBottomNav active="profile" />

      {/* Modal Logout */}
      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconWrapper}>
              <MaterialIcons name="logout" size={28} color="#E53935" />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Keluar
            </Text>
            <Text style={[styles.modalMsg, { color: colors.textSecondary }]}>
              Yakin ingin keluar dari akun?
            </Text>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                setLogoutVisible(false);
                await clearAdminSession();
                await supabase.auth.signOut();
                router.replace("/login");
              }}
            >
              <Text style={styles.logoutBtnText}>Ya, Keluar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setLogoutVisible(false)}
            >
              <Text
                style={[styles.cancelText, { color: colors.textSecondary }]}
              >
                Batal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function OrderStatus({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.statusItem}>
      <View style={[styles.statusIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statusCount}>{count}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "700" },
  avatarWrapper: { alignSelf: "center", marginBottom: 16 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: ACCENT,
    backgroundColor: "#E0E0E0",
  },
  name: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    textAlign: "center",
    fontSize: 13,
    textDecorationLine: "underline",
    marginBottom: 2,
  },
  nim: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  monitorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  monitorTitle: { fontSize: 16, fontWeight: "800" },
  monitorLink: { fontSize: 12, color: "#2D6A4F", fontWeight: "700" },
  statusGrid: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 10,
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8FAFB",
    borderRadius: 12,
    paddingVertical: 14,
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statusCount: { fontSize: 18, fontWeight: "900", color: "#1a1a2e" },
  statusLabel: { fontSize: 12, color: "#6B7280", fontWeight: "700" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  menuIcon: { marginRight: 14 },
  menuText: { fontSize: 15 },
  divider: { height: 1, marginHorizontal: 18 },

  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    padding: 24,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  modalIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  modalMsg: { fontSize: 14, marginBottom: 4, textAlign: "center" },
  logoutBtn: {
    marginTop: 16,
    backgroundColor: "#E53935",
    paddingVertical: 13,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  logoutBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 8,
    width: "100%",
    alignItems: "center",
  },
  cancelText: { fontSize: 14 },
});
