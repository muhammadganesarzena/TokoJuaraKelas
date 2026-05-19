import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRefreshControl } from "../hooks/useRefreshControl";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import { useAdminTheme } from "./hooks/useAdminTheme";
import { createOverviewStyles } from "./styles/overviewStyles";

const { width } = Dimensions.get("window");
const CHART_W = width - 80; // card padding 16*2 + y-label 36 + margin 12
const CHART_H = 160;
const PAD_X = 6;
const PAD_Y = 14;

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "7d" | "30d" | "1y";
type ChartPoint = { label: string; value: number };

// ─── Cubic Bezier smooth path ─────────────────────────────────────────────────
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1],
      c = pts[i];
    const mx = (p.x + c.x) / 2;
    d += ` C ${mx} ${p.y}, ${mx} ${c.y}, ${c.x} ${c.y}`;
  }
  return d;
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
function RevenueChart({
  data,
  color = "#10B981",
}: {
  data: ChartPoint[];
  color?: string;
}) {
  if (data.length < 2)
    return (
      <View
        style={{
          height: CHART_H,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#ccc", fontSize: 12 }}>Data tidak cukup</Text>
      </View>
    );

  const vals = data.map((d) => d.value);
  const maxVal = Math.max(...vals, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const toX = (i: number) =>
    PAD_X + (i / (data.length - 1)) * (CHART_W - PAD_X * 2);
  const toY = (v: number) =>
    PAD_Y + (1 - (v - minVal) / range) * (CHART_H - PAD_Y * 2);

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x} ${toY(0)} L ${pts[0].x} ${toY(0)} Z`;

  // Y gridlines: top, mid, bottom
  const yLevels = [maxVal, maxVal / 2, 0].map((v) => ({ v, y: toY(v) }));

  const fmt = (v: number) =>
    v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}Jt`
      : v >= 1_000
        ? `${(v / 1_000).toFixed(0)}K`
        : `${Math.round(v)}`;

  // X labels: pick max 5 evenly spaced
  const step = Math.max(1, Math.floor(data.length / 4));
  const xIdxs = [...Array(data.length).keys()]
    .filter((i) => i % step === 0 || i === data.length - 1)
    .slice(0, 5);

  // Key dots: first, last, max value index
  const maxIdx = vals.indexOf(Math.max(...vals));
  const keyIdxs = new Set([0, data.length - 1, maxIdx]);

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        {/* Y labels */}
        <View style={{ width: 36, height: CHART_H, position: "relative" }}>
          {yLevels.map(({ v, y }, i) => (
            <Text key={i} style={[S.yLbl, { top: y - 7 }]}>
              {fmt(v)}
            </Text>
          ))}
        </View>

        {/* SVG */}
        <Svg width={CHART_W} height={CHART_H}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Grid */}
          {yLevels.map(({ y }, i) => (
            <Path
              key={i}
              d={`M ${PAD_X} ${y} L ${CHART_W - PAD_X} ${y}`}
              stroke="#F0F0F0"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}

          {/* Area */}
          <Path d={area} fill="url(#grad)" />
          {/* Line */}
          <Path
            d={line}
            stroke={color}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* Key dots */}
          {pts.map((p, i) =>
            keyIdxs.has(i) ? (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={5}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
              />
            ) : null,
          )}
        </Svg>
      </View>

      {/* X labels */}
      <View style={{ marginLeft: 36, height: 20, position: "relative" }}>
        {xIdxs.map((idx) => (
          <Text key={idx} style={[S.xLbl, { left: toX(idx) - 14, width: 28 }]}>
            {data[idx].label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  yLbl: {
    position: "absolute",
    fontSize: 9,
    color: "#9CA3AF",
    textAlign: "right",
    width: 34,
  },
  xLbl: {
    position: "absolute",
    fontSize: 9,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

// ─── Sparkline Bar ────────────────────────────────────────────────────────────
function SparkBar({
  data,
  color,
  height = 28,
}: {
  data: number[];
  color: string;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <View
      style={{ flexDirection: "row", alignItems: "flex-end", height, gap: 3 }}
    >
      {data.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: (v / max) * height,
            backgroundColor: color,
            borderRadius: 3,
            opacity:
              i === data.length - 1 ? 1 : 0.35 + (i / data.length) * 0.55,
          }}
        />
      ))}
    </View>
  );
}

// ─── Configs ──────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  string,
  { color: string; icon: keyof typeof Ionicons.glyphMap; bg: string }
> = {
  pending: { color: "#2D6A4F", icon: "time-outline", bg: "#E8F5E9" },
  accepted: {
    color: "#10B981",
    icon: "checkmark-circle-outline",
    bg: "#D1FAE5",
  },
  proses: { color: "#3B82F6", icon: "reload-circle-outline", bg: "#DBEAFE" },
  dikirim: { color: "#8B5CF6", icon: "bicycle-outline", bg: "#EDE9FE" },
  selesai: {
    color: "#10B981",
    icon: "checkmark-circle-outline",
    bg: "#D1FAE5",
  },
  batal: { color: "#EF4444", icon: "close-circle-outline", bg: "#FEE2E2" },
};

const QUICK_ACTIONS = [
  {
    label: "Tambah Produk",
    desc: "Kelola & tambah produk baru",
    icon: "cube-outline" as const,
    color: "#3B82F6",
    route: "/admin/products",
  },
  {
    label: "Lihat Order",
    desc: "Pantau & update status order",
    icon: "receipt-outline" as const,
    color: "#10B981",
    route: "/admin/orders",
  },
  {
    label: "Kelola User",
    desc: "Data pengguna terdaftar",
    icon: "people-outline" as const,
    color: "#2D6A4F",
    route: "/admin/users",
  },
  {
    label: "Kategori",
    desc: "Atur kategori produk",
    icon: "pricetag-outline" as const,
    color: "#8B5CF6",
    route: "/admin/categories",
  },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
  { key: "1y", label: "1 Tahun" },
];

// ─── Data Grouping ────────────────────────────────────────────────────────────
function groupOrders(orders: any[], period: Period): ChartPoint[] {
  const now = new Date();

  if (period === "7d") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString("id-ID", { weekday: "short" }).slice(0, 2),
        value: orders
          .filter(
            (o) => new Date(o.created_at).toDateString() === d.toDateString(),
          )
          .reduce((s, o) => s + o.total_price, 0),
      };
    });
  }

  if (period === "30d") {
    return Array.from({ length: 4 }, (_, w) => {
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return {
        label: `Mg ${4 - w}`,
        value: orders
          .filter((o) => {
            const d = new Date(o.created_at);
            return d >= start && d <= end;
          })
          .reduce((s, o) => s + o.total_price, 0),
      };
    }).reverse();
  }

  // 1y
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return {
      label: d.toLocaleDateString("id-ID", { month: "short" }),
      value: orders
        .filter((o) => {
          const od = new Date(o.created_at);
          return (
            od.getFullYear() === d.getFullYear() &&
            od.getMonth() === d.getMonth()
          );
        })
        .reduce((s, o) => s + o.total_price, 0),
    };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Overview() {
  const { colors, isDark } = useAdminTheme();
  const styles = useMemo(
    () => createOverviewStyles(colors, isDark, width),
    [colors, isDark],
  );

  const AnimatedNumber = ({
    value,
    suffix = "",
  }: {
    value: number;
    suffix?: string;
  }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const [disp, setDisp] = useState(0);

    useEffect(() => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: value,
        duration: 1100,
        useNativeDriver: false,
      }).start();
      const l = anim.addListener(({ value: v }) => setDisp(Math.floor(v)));
      return () => anim.removeListener(l);
    }, [value, anim]);

    return (
      <Text style={styles.statNum}>
        {disp.toLocaleString("id-ID")}
        {suffix}
      </Text>
    );
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "orders">("overview");
  const [period, setPeriod] = useState<Period>("7d");
  const [chartLoading, setChartLoading] = useState(false);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>(
    {},
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [products, orders, users] = await Promise.all([
      supabase.from("products").select("id"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id"),
    ]);
    const od = orders.data || [];
    const rev = od.reduce((s, o) => s + o.total_price, 0);
    setStats({
      totalProducts: products.data?.length || 0,
      totalOrders: od.length,
      totalUsers: users.data?.length || 0,
      totalRevenue: rev,
    });
    setAllOrders(od);
    setRecentOrders(od.slice(0, 5));
    setChartData(groupOrders(od, "7d"));
    const bs: Record<string, number> = {};
    od.forEach((o) => {
      bs[o.status] = (bs[o.status] || 0) + 1;
    });
    setOrdersByStatus(bs);
    if (!silent) setLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await fetchStats(true);
  });

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useFocusEffect(
    useCallback(() => {
      void fetchStats(true);
    }, [fetchStats]),
  );

  useEffect(() => {
    if (!allOrders.length) return;
    setChartLoading(true);
    const t = setTimeout(() => {
      setChartData(groupOrders(allOrders, period));
      setChartLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [period, allOrders]);

  const totalForPct = Math.max(stats.totalOrders, 1);
  const chartTotal = chartData.reduce((s, d) => s + d.value, 0);

  const STAT_CARDS = [
    {
      label: "Produk",
      value: stats.totalProducts,
      icon: "cube" as const,
      color: "#3B82F6",
      bg: isDark ? colors.card : "#EFF6FF",
      spark: [2, 2, 3, 4, 4, 5, stats.totalProducts % 10 || 4],
      suffix: "",
    },
    {
      label: "Order",
      value: stats.totalOrders,
      icon: "cart" as const,
      color: "#10B981",
      bg: isDark ? colors.card : "#ECFDF5",
      spark: [3, 7, 5, 12, 8, 15, stats.totalOrders % 20 || 10],
      suffix: "",
    },
    {
      label: "Pengguna",
      value: stats.totalUsers,
      icon: "people" as const,
      color: colors.accent,
      bg: isDark ? colors.card : "#E8F5E9",
      spark: [1, 2, 2, 4, 3, 5, stats.totalUsers % 10 || 3],
      suffix: "",
    },
    {
      label: "Pendapatan",
      value: Math.floor(stats.totalRevenue / 1000),
      icon: "cash" as const,
      color: "#8B5CF6",
      bg: isDark ? colors.card : "#F5F3FF",
      spark: [
        1,
        4,
        3,
        8,
        6,
        11,
        Math.min(stats.totalRevenue / 100000, 20) || 5,
      ],
      suffix: "K",
    },
  ];

  return (
    <View style={styles.container}>
      <AdminHeader title="Ringkasan" onMenuPress={() => setSidebarOpen(true)} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {/* Tab bar */}
          <View style={styles.tabBar}>
            {(["overview", "orders"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Ionicons
                  name={t === "overview" ? "grid-outline" : "receipt-outline"}
                  size={15}
                  color={tab === t ? colors.accent : colors.textMuted}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[styles.tabText, tab === t && styles.tabTextActive]}
                >
                  {t === "overview" ? "Ringkasan" : "Order Terbaru"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.accent]}
                tintColor={colors.accent}
              />
            }
          >
            {tab === "overview" ? (
              <>
                {/* Stat Cards */}
                <View style={styles.statsGrid}>
                  {STAT_CARDS.map((c) => (
                    <View
                      key={c.label}
                      style={[styles.statCard, { backgroundColor: c.bg }]}
                    >
                      <View style={styles.statCardTop}>
                        <View
                          style={[
                            styles.iconCircle,
                            { backgroundColor: c.color + "20" },
                          ]}
                        >
                          <Ionicons name={c.icon} size={20} color={c.color} />
                        </View>
                        <Ionicons
                          name="trending-up-outline"
                          size={14}
                          color={c.color}
                        />
                      </View>
                      <AnimatedNumber value={c.value} suffix={c.suffix} />
                      <Text style={styles.statLabel}>{c.label}</Text>
                      <View style={{ marginTop: 10 }}>
                        <SparkBar data={c.spark} color={c.color} />
                      </View>
                    </View>
                  ))}
                </View>

                {/* ── Revenue Chart ── */}
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={16}
                    color={colors.accent}
                  />
                  <Text style={styles.sectionTitle}>Grafik Pendapatan</Text>
                </View>

                <View style={styles.chartCard}>
                  {/* Header row */}
                  <View style={styles.chartHeader}>
                    <View>
                      <Text style={styles.chartLabelSub}>Total Periode</Text>
                      <Text style={styles.chartLabelVal}>
                        Rp {chartTotal.toLocaleString("id-ID")}
                      </Text>
                    </View>
                    {/* Period Pills */}
                    <View style={styles.periodRow}>
                      {PERIODS.map((p) => (
                        <TouchableOpacity
                          key={p.key}
                          style={[
                            styles.periodPill,
                            period === p.key && styles.periodPillActive,
                          ]}
                          onPress={() => setPeriod(p.key)}
                        >
                          <Text
                            style={[
                              styles.periodText,
                              period === p.key && styles.periodTextActive,
                            ]}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Chart body */}
                  <View style={{ marginTop: 16, minHeight: CHART_H + 28 }}>
                    {chartLoading ? (
                      <View
                        style={{
                          height: CHART_H,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ActivityIndicator size="small" color={colors.accent} />
                      </View>
                    ) : (
                      <RevenueChart data={chartData} color="#10B981" />
                    )}
                  </View>
                </View>

                {/* Distribusi Status */}
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="pie-chart-outline"
                    size={16}
                    color={colors.accent}
                  />
                  <Text style={styles.sectionTitle}>
                    Distribusi Status Order
                  </Text>
                </View>
                <View style={styles.distCard}>
                  {Object.entries(STATUS_CFG).map(([status, cfg]) => {
                    const count = ordersByStatus[status] || 0;
                    const pct = Math.round((count / totalForPct) * 100);
                    return (
                      <View key={status} style={styles.statusRow}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: cfg.color },
                          ]}
                        />
                        <Ionicons
                          name={cfg.icon}
                          size={14}
                          color={cfg.color}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.statusLabel}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                        <View style={styles.progTrack}>
                          <View
                            style={[
                              styles.progFill,
                              { width: `${pct}%`, backgroundColor: cfg.color },
                            ]}
                          />
                        </View>
                        <Text
                          style={[styles.statusCount, { color: cfg.color }]}
                        >
                          {count}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                  <Ionicons name="flash-outline" size={16} color={colors.accent} />
                  <Text style={styles.sectionTitle}>Aksi Cepat</Text>
                </View>
                <View style={styles.quickActions}>
                  {QUICK_ACTIONS.map((a) => (
                    <TouchableOpacity
                      key={a.label}
                      style={styles.quickBtn}
                      activeOpacity={0.7}
                      onPress={() => router.push(a.route as any)}
                    >
                      <View
                        style={[
                          styles.quickIcon,
                          { backgroundColor: a.color + "18" },
                        ]}
                      >
                        <Ionicons name={a.icon} size={22} color={a.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.quickLabel}>{a.label}</Text>
                        <Text style={styles.quickDesc}>{a.desc}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#C8C8C8"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                {/* Order Terbaru */}
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={16} color={colors.accent} />
                  <Text style={styles.sectionTitle}>5 Order Terbaru</Text>
                </View>
                {recentOrders.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.emptyText}>Belum ada order</Text>
                  </View>
                ) : (
                  <>
                    {recentOrders.map((o) => {
                      const cfg = STATUS_CFG[o.status] || {
                        color: "#888",
                        icon: "help-circle-outline" as const,
                        bg: "#f5f5f5",
                      };
                      return (
                        <TouchableOpacity
                          key={o.id}
                          style={styles.orderCard}
                          activeOpacity={0.75}
                          onPress={() => router.push("/admin/orders" as any)}
                        >
                          <View
                            style={[
                              styles.orderAccent,
                              { backgroundColor: cfg.color },
                            ]}
                          />
                          <View style={styles.orderBody}>
                            <View style={styles.orderTop}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <Ionicons
                                  name="receipt-outline"
                                  size={14}
                                  color="#444"
                                />
                                <Text style={styles.orderId}>
                                  #{o.id.slice(0, 8).toUpperCase()}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.badge,
                                  { backgroundColor: cfg.bg },
                                ]}
                              >
                                <Ionicons
                                  name={cfg.icon}
                                  size={11}
                                  color={cfg.color}
                                  style={{ marginRight: 3 }}
                                />
                                <Text
                                  style={[
                                    styles.badgeText,
                                    { color: cfg.color },
                                  ]}
                                >
                                  {o.status}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.orderBottom}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Ionicons
                                  name="calendar-outline"
                                  size={11}
                                  color="#999"
                                />
                                <Text style={styles.orderDate}>
                                  {new Date(o.created_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Ionicons
                                  name="cash-outline"
                                  size={13}
                                  color={colors.accent}
                                />
                                <Text style={styles.orderPrice}>
                                  Rp {o.total_price.toLocaleString("id-ID")}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#ccc"
                            style={{ alignSelf: "center", marginRight: 12 }}
                          />
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      style={styles.lihatSemuaBtn}
                      onPress={() => router.push("/admin/orders" as any)}
                    >
                      <Ionicons name="list-outline" size={16} color={colors.accent} />
                      <Text style={styles.lihatSemuaText}>
                        Lihat Semua Order
                      </Text>
                      <Ionicons
                        name="arrow-forward-outline"
                        size={14}
                        color={colors.accent}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/overview"
      />
    </View>
  );
}
