import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

export default function Overview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const [products, orders, users] = await Promise.all([
      supabase.from("products").select("id"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id"),
    ]);

    const revenue =
      orders.data?.reduce((sum, o) => sum + o.total_price, 0) || 0;

    setStats({
      totalProducts: products.data?.length || 0,
      totalOrders: orders.data?.length || 0,
      totalUsers: users.data?.length || 0,
      totalRevenue: revenue,
    });
    setRecentOrders(orders.data?.slice(0, 5) || []);
    setLoading(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA000";
      case "proses":
        return "#1976D2";
      case "dikirim":
        return "#7B1FA2";
      case "selesai":
        return "#388E3C";
      case "batal":
        return "#E53935";
      default:
        return "#888";
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Overview" onMenuPress={() => setSidebarOpen(true)} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Stats */}
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "Produk", value: stats.totalProducts, color: "#E3F2FD" },
              { label: "Order", value: stats.totalOrders, color: "#E8F5E9" },
              { label: "User", value: stats.totalUsers, color: "#FFF3E0" },
              {
                label: "Revenue",
                value:
                  stats.totalRevenue > 0
                    ? `${(stats.totalRevenue / 1000000).toFixed(1)}Jt`
                    : "0",
                color: "#FCE4EC",
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: stat.color }]}
              >
                <Text style={styles.statNum}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Recent Orders */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Order Terbaru
          </Text>
          {recentOrders.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada order.</Text>
          ) : (
            recentOrders.map((o) => (
              <View key={o.id} style={styles.orderCard}>
                <View>
                  <Text style={styles.orderId}>#{o.id.slice(0, 8)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(o.created_at).toLocaleDateString("id-ID")}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.orderPrice}>
                    Rp {o.total_price.toLocaleString("id-ID")}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusColor(o.status) },
                    ]}
                  >
                    <Text style={styles.badgeText}>{o.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/overview"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 12,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNum: { fontSize: 28, fontWeight: "800", color: "#1a1a2e" },
  statLabel: { fontSize: 13, color: "#555", marginTop: 4 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: { fontSize: 13, fontWeight: "700", color: "#1a1a2e" },
  orderDate: { fontSize: 11, color: "#888", marginTop: 2 },
  orderPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D6A4F",
    marginRight: 8,
  },
  row: { flexDirection: "row", alignItems: "center" },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
});
