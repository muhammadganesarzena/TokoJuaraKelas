import React, { useEffect, useState } from "react";
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

type User = {
  id: string;
  full_name: string;
  username: string;
  phone: string;
  address: string;
  email: string;
};

export default function Users() {
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
    <View style={styles.container}>
      <AdminHeader title="User" onMenuPress={() => setSidebarOpen(true)} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
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
            <Text style={styles.emptyText}>Belum ada user terdaftar.</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1B4332",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  cardSub: { fontSize: 12, color: "#2D6A4F", marginTop: 2 },
  cardMeta: { fontSize: 11, color: "#888", marginTop: 2 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
});
