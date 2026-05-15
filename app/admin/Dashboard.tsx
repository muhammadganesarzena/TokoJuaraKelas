import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";

type Tab = "overview" | "products" | "categories" | "orders" | "users";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  brand: string;
  image_url: string;
  category_id: string;
};

type Category = {
  id: string;
  name: string;
};

type Order = {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
};

type User = {
  id: string;
  full_name: string;
  username: string;
  phone: string;
  address: string;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Overview stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  // Product modal
  const [productModal, setProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pStock, setPStock] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pBrand, setPBrand] = useState("");
  const [pImage, setPImage] = useState("");
  const [pCategory, setPCategory] = useState("");

  // Category modal
  const [categoryModal, setCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [cName, setCName] = useState("");

  // Order modal
  const [orderModal, setOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchOrders(),
      fetchUsers(),
    ]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setProducts(data);
      setStats((prev) => ({ ...prev, totalProducts: data.length }));
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setOrders(data);
      const revenue = data.reduce((sum, o) => sum + o.total_price, 0);
      setStats((prev) => ({
        ...prev,
        totalOrders: data.length,
        totalRevenue: revenue,
      }));
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    if (data) {
      setUsers(data);
      setStats((prev) => ({ ...prev, totalUsers: data.length }));
    }
  };

  // ── PRODUCT CRUD ──
  const openAddProduct = () => {
    setEditProduct(null);
    setPName("");
    setPPrice("");
    setPStock("");
    setPDesc("");
    setPBrand("");
    setPImage("");
    setPCategory("");
    setProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditProduct(p);
    setPName(p.name);
    setPPrice(p.price.toString());
    setPStock(p.stock.toString());
    setPDesc(p.description || "");
    setPBrand(p.brand || "");
    setPImage(p.image_url || "");
    setPCategory(p.category_id || "");
    setProductModal(true);
  };

  const saveProduct = async () => {
    if (!pName.trim() || !pPrice.trim() || !pStock.trim()) {
      Alert.alert("Error", "Nama, harga, dan stok wajib diisi.");
      return;
    }
    const payload = {
      name: pName.trim(),
      price: parseInt(pPrice),
      stock: parseInt(pStock),
      description: pDesc.trim(),
      brand: pBrand.trim(),
      image_url: pImage.trim(),
      category_id: pCategory || null,
    };

    if (editProduct) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editProduct.id);
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
    }

    setProductModal(false);
    fetchProducts();
  };

  const deleteProduct = (id: string) => {
    Alert.alert("Hapus Produk", "Yakin ingin menghapus produk ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await supabase.from("products").delete().eq("id", id);
          fetchProducts();
        },
      },
    ]);
  };

  // ── CATEGORY CRUD ──
  const openAddCategory = () => {
    setEditCategory(null);
    setCName("");
    setCategoryModal(true);
  };

  const openEditCategory = (c: Category) => {
    setEditCategory(c);
    setCName(c.name);
    setCategoryModal(true);
  };

  const saveCategory = async () => {
    if (!cName.trim()) {
      Alert.alert("Error", "Nama kategori wajib diisi.");
      return;
    }
    if (editCategory) {
      const { error } = await supabase
        .from("categories")
        .update({ name: cName.trim() })
        .eq("id", editCategory.id);
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({ name: cName.trim() });
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
    }
    setCategoryModal(false);
    fetchCategories();
  };

  const deleteCategory = (id: string) => {
    Alert.alert("Hapus Kategori", "Yakin ingin menghapus kategori ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await supabase.from("categories").delete().eq("id", id);
          fetchCategories();
        },
      },
    ]);
  };

  // ── ORDER UPDATE ──
  const openOrderDetail = (o: Order) => {
    setSelectedOrder(o);
    setOrderStatus(o.status);
    setOrderModal(true);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("id", selectedOrder.id);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setOrderModal(false);
    fetchOrders();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA000";
      case "accepted":
        return "#2D6A4F";
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

  const handleLogout = () => {
    Alert.alert("Logout", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  // ── RENDER TABS ──
  const renderOverview = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionTitle}>Ringkasan</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
          <Text style={styles.statNum}>{stats.totalProducts}</Text>
          <Text style={styles.statLabel}>Produk</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
          <Text style={styles.statNum}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Order</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
          <Text style={styles.statNum}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>User</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#FCE4EC" }]}>
          <Text style={styles.statNum} numberOfLines={1}>
            {stats.totalRevenue > 0
              ? `${(stats.totalRevenue / 1000000).toFixed(1)}Jt`
              : "0"}
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
        Order Terbaru
      </Text>
      {orders.slice(0, 5).map((o) => (
        <View key={o.id} style={styles.recentCard}>
          <View>
            <Text style={styles.recentId}>#{o.id.slice(0, 8)}</Text>
            <Text style={styles.recentDate}>
              {new Date(o.created_at).toLocaleDateString("id-ID")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.recentPrice}>
              Rp {o.total_price.toLocaleString("id-ID")}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor(o.status) },
              ]}
            >
              <Text style={styles.statusText}>{o.status}</Text>
            </View>
          </View>
        </View>
      ))}
      {orders.length === 0 && (
        <Text style={styles.emptyText}>Belum ada order.</Text>
      )}
    </ScrollView>
  );

  const renderProducts = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.addBtn} onPress={openAddProduct}>
        <Text style={styles.addBtnText}>+ Tambah Produk</Text>
      </TouchableOpacity>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{item.name}</Text>
              <Text style={styles.listSub}>
                Rp {item.price.toLocaleString("id-ID")} · Stok: {item.stock}
              </Text>
              {item.brand ? (
                <Text style={styles.listMeta}>{item.brand}</Text>
              ) : null}
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditProduct(item)}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteProduct(item.id)}
              >
                <Text style={styles.deleteBtnText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Belum ada produk. Tambah sekarang!
          </Text>
        }
      />
    </View>
  );

  const renderCategories = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.addBtn} onPress={openAddCategory}>
        <Text style={styles.addBtnText}>+ Tambah Kategori</Text>
      </TouchableOpacity>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <Text style={[styles.listTitle, { flex: 1 }]}>{item.name}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditCategory(item)}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteCategory(item.id)}
              >
                <Text style={styles.deleteBtnText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada kategori.</Text>
        }
      />
    </View>
  );

  const renderOrders = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listCard}
            onPress={() => openOrderDetail(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>#{item.id.slice(0, 8)}</Text>
              <Text style={styles.listSub}>
                Rp {item.total_price.toLocaleString("id-ID")}
              </Text>
              <Text style={styles.listMeta}>
                {new Date(item.created_at).toLocaleDateString("id-ID")}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada order.</Text>
        }
      />
    </View>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{item.full_name || "-"}</Text>
              <Text style={styles.listSub}>@{item.username || "-"}</Text>
              {item.phone ? (
                <Text style={styles.listMeta}>{item.phone}</Text>
              ) : null}
              {item.address ? (
                <Text style={styles.listMeta} numberOfLines={1}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {(
          ["overview", "products", "categories", "orders", "users"] as Tab[]
        ).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "overview"
                ? "Overview"
                : tab === "products"
                  ? "Produk"
                  : tab === "categories"
                    ? "Kategori"
                    : tab === "orders"
                      ? "Order"
                      : "User"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#C85C2D"
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "products" && renderProducts()}
          {activeTab === "categories" && renderCategories()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "users" && renderUsers()}
        </>
      )}

      {/* Modal Produk */}
      <Modal visible={productModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editProduct ? "Edit Produk" : "Tambah Produk"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                {
                  label: "Nama Produk *",
                  value: pName,
                  setter: setPName,
                  placeholder: "Nama produk",
                },
                {
                  label: "Harga *",
                  value: pPrice,
                  setter: setPPrice,
                  placeholder: "Contoh: 15000",
                  keyboard: "numeric",
                },
                {
                  label: "Stok *",
                  value: pStock,
                  setter: setPStock,
                  placeholder: "Jumlah stok",
                  keyboard: "numeric",
                },
                {
                  label: "Brand",
                  value: pBrand,
                  setter: setPBrand,
                  placeholder: "Contoh: Stabilo",
                },
                {
                  label: "URL Gambar",
                  value: pImage,
                  setter: setPImage,
                  placeholder: "https://...",
                },
                {
                  label: "Deskripsi",
                  value: pDesc,
                  setter: setPDesc,
                  placeholder: "Deskripsi produk",
                },
              ].map((field) => (
                <View key={field.label}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      field.label === "Deskripsi" && { height: 80 },
                    ]}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor="#999"
                    keyboardType={(field.keyboard as any) || "default"}
                    multiline={field.label === "Deskripsi"}
                  />
                </View>
              ))}

              <Text style={styles.inputLabel}>Kategori</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.categoryChip,
                      pCategory === c.id && styles.categoryChipActive,
                    ]}
                    onPress={() => setPCategory(c.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        pCategory === c.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.saveBtn} onPress={saveProduct}>
                <Text style={styles.saveBtnText}>
                  {editProduct ? "Simpan Perubahan" : "Tambah Produk"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setProductModal(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Kategori */}
      <Modal visible={categoryModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { maxHeight: "40%" }]}>
            <Text style={styles.modalTitle}>
              {editCategory ? "Edit Kategori" : "Tambah Kategori"}
            </Text>
            <Text style={styles.inputLabel}>Nama Kategori *</Text>
            <TextInput
              style={styles.input}
              value={cName}
              onChangeText={setCName}
              placeholder="Nama kategori"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveCategory}>
              <Text style={styles.saveBtnText}>
                {editCategory ? "Simpan" : "Tambah"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setCategoryModal(false)}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Update Status Order */}
      <Modal visible={orderModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { maxHeight: "55%" }]}>
            <Text style={styles.modalTitle}>Update Status Order</Text>
            <Text style={styles.inputLabel}>
              Order #{selectedOrder?.id.slice(0, 8)}
            </Text>
            <Text style={[styles.listSub, { marginBottom: 12 }]}>
              Total: Rp {selectedOrder?.total_price.toLocaleString("id-ID")}
            </Text>

            {["pending", "proses", "dikirim", "selesai", "batal"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  orderStatus === s && { backgroundColor: statusColor(s) },
                ]}
                onPress={() => setOrderStatus(s)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    orderStatus === s && { color: "#fff" },
                  ]}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={updateOrderStatus}
            >
              <Text style={styles.saveBtnText}>Simpan Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setOrderModal(false)}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 56 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1a1a2e" },
  logoutText: { color: "#E53935", fontWeight: "600" },
  tabBar: { maxHeight: 48, marginBottom: 8 },
  tabBarContent: { paddingHorizontal: 16, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  tabActive: { backgroundColor: "#C85C2D" },
  tabText: { fontSize: 13, color: "#666", fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  tabContent: { flex: 1, paddingHorizontal: 16 },
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
  recentCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentId: { fontSize: 13, fontWeight: "700", color: "#1a1a2e" },
  recentDate: { fontSize: 11, color: "#888", marginTop: 2 },
  recentPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#C85C2D",
    marginRight: 8,
  },
  row: { flexDirection: "row", alignItems: "center" },
  addBtn: {
    backgroundColor: "#C85C2D",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  listTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  listSub: { fontSize: 12, color: "#C85C2D", marginTop: 2 },
  listMeta: { fontSize: 11, color: "#888", marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 6 },
  editBtn: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  deleteBtn: {
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 14,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  inputLabel: { fontSize: 13, color: "#555", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryChipActive: { backgroundColor: "#C85C2D", borderColor: "#C85C2D" },
  categoryChipText: { fontSize: 12, color: "#555", fontWeight: "600" },
  categoryChipTextActive: { color: "#fff" },
  saveBtn: {
    backgroundColor: "#C85C2D",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: "#888", fontSize: 14 },
  statusOption: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  statusOptionText: { fontSize: 14, fontWeight: "600", color: "#555" },
});
