import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

type Category = {
  id: string;
  name: string;
  products?: {
    id: string;
    name: string;
  }[];
};

export default function Categories() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [cName, setCName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
    *,
    products (
      id,
      name
    )
  `,
      )
      .order("name");

    if (error) {
      console.log(error);
    }
    if (data) setCategories(data);
    setLoading(false);
  };

  const openAdd = () => {
    setEditCategory(null);
    setCName("");
    setModal(true);
  };
  const openEdit = (c: Category) => {
    setEditCategory(c);
    setCName(c.name);
    setModal(true);
  };

  const save = async () => {
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
    setModal(false);
    fetchData();
  };

  const deleteCategory = (id: string) => {
    Alert.alert("Hapus Kategori", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await supabase.from("categories").delete().eq("id", id);
          fetchData();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Kategori" onMenuPress={() => setSidebarOpen(true)} />

      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>+ Tambah Kategori</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>

                <Text style={styles.productCount}>
                  {item.products?.length || 0} produk
                </Text>

                {item.products && item.products.length > 0 ? (
                  <View style={{ marginTop: 6 }}>
                    {item.products.slice(0, 3).map((product) => (
                      <Text key={product.id} style={styles.productName}>
                        • {product.name}
                      </Text>
                    ))}

                    {item.products.length > 3 && (
                      <Text style={styles.moreText}>
                        +{item.products.length - 3} produk lainnya
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.emptyCategory}>Belum ada produk</Text>
                )}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEdit(item)}
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
      )}

      <Modal visible={modal} animationType="slide" transparent>
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
            <TouchableOpacity style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveBtnText}>
                {editCategory ? "Simpan" : "Tambah"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModal(false)}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/categories"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  addBtn: {
    backgroundColor: "#2D6A4F",
    margin: 16,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  actionRow: { flexDirection: "row", gap: 6 },
  editBtn: {
    backgroundColor: "#1B4332",
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
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
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
  saveBtn: {
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: "#888", fontSize: 14 },

  productCount: {
    fontSize: 12,
    color: "#2D6A4F",
    fontWeight: "700",
    marginTop: 4,
  },

  productName: {
    fontSize: 12,
    color: "#444",
    marginTop: 2,
  },

  moreText: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    fontStyle: "italic",
  },

  emptyCategory: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    fontStyle: "italic",
  },
});
