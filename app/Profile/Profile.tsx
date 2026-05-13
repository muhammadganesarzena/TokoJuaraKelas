import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const ORANGE = "#C85C2D";

export default function Profile() {
  const router = useRouter();
  const { profile, loadingProfile } = useProfile();
  const { colors } = useTheme();
  const [logoutVisible, setLogoutVisible] = useState(false);

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
        <ActivityIndicator size="large" color="#C85C2D" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => router.push("/Homepage/Homepage")}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: profile.image || DEFAULT_IMAGE }}
          style={styles.avatar}
        />
        <TouchableOpacity
          style={styles.editBadge}
          onPress={() => router.push("/Profile/EditProfile")}
        >
          <Ionicons name="pencil" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
      <Text style={[styles.email, { color: colors.textSecondary }]}>
        {profile.email}
      </Text>
      <Text style={[styles.nim, { color: colors.textSecondary }]}>
        {profile.nim}
      </Text>

      {/* Menu Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/Profile/EditProfile")}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.text}
            style={styles.menuIcon}
          />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Edit profile information
          </Text>
        </TouchableOpacity>

        <View
          style={[styles.divider, { backgroundColor: colors.borderLight }]}
        />

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons
            name="heart-outline"
            size={20}
            color={colors.text}
            style={styles.menuIcon}
          />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Edit interest
          </Text>
        </TouchableOpacity>

        <View
          style={[styles.divider, { backgroundColor: colors.borderLight }]}
        />

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.text}
            style={styles.menuIcon}
          />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Notifications
          </Text>
        </TouchableOpacity>
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
          <Text style={[styles.menuText, { color: colors.text }]}>Log out</Text>
        </View>
      </TouchableOpacity>

      {/* Modal Logout */}
      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconWrapper}>
              <MaterialIcons name="logout" size={28} color="#E53935" />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Logout
            </Text>
            <Text style={[styles.modalMsg, { color: colors.textSecondary }]}>
              Are you sure you want to logout?
            </Text>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                setLogoutVisible(false);
                router.replace("/login");
              }}
            >
              <Text style={styles.logoutBtnText}>Yes, Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setLogoutVisible(false)}
            >
              <Text
                style={[styles.cancelText, { color: colors.textSecondary }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
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
    borderColor: ORANGE,
    backgroundColor: "#E0E0E0",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
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
