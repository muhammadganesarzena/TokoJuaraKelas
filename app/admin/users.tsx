import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import { useAdminTheme } from "./hooks/useAdminTheme";
import { Colors } from "../context/ThemeContext";

type User = {
  id: string;
  full_name: string;
  username: string;
  phone: string;
  address: string;
  email: string;
};

export default function Users() {
  const { colors, base } = useAdminTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*");
    if (data) setUsers(data);
    setLoading(false);
  };

  return (
    <View style={base.container}>
      <AdminHeader title="Pengguna" onMenuPress={() => setSidebarOpen(true)} />

      <View style={styles.toolbar}>
        <View style={styles.statPill}>
          <View style={styles.statIcon}>
            <Ionicons name="people" size={20} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Pengguna terdaftar</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={base.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.full_name || "?")[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.full_name || "-"}</Text>
                <Text style={styles.cardSub}>@{item.username || "-"}</Text>
                {item.email ? (
                  <Text style={styles.cardMeta}>{item.email}</Text>
                ) : null}
                {item.phone ? (
                  <Text style={styles.cardMeta}>{item.phone}</Text>
                ) : null}
                {item.address ? (
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {item.address}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={base.emptyText}>Belum ada user terdaftar.</Text>
          }
        />
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/users"
      />
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    toolbar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: "600",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.accent,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
    cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
    cardSub: { fontSize: 12, color: colors.accent, marginTop: 2 },
    cardMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  });
