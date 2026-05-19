import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
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
import {
    AdminCatalogEmpty,
    AdminCatalogToolbar,
    AdminIconActionButtons,
    AdminModalHeader,
} from "./components/AdminCatalogUi";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import { useAdminTheme } from "./hooks/useAdminTheme";
import { CatalogPalette } from "./styles/catalogTheme";

type Category = {
  id: string;
  name: string;
  products?: {
    id: string;
    name: string;
  }[];
};

export default function Categories() {
  const { palette: C, catalogStyles: catalogShared, colors } = useAdminTheme();
  const styles = useMemo(() => createCategoryStyles(C), [C]);

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
      Alert.alert("Kesalahan", "Nama kategori wajib diisi.");
      return;
    }
    if (editCategory) {
      const { error } = await supabase
        .from("categories")
        .update({ name: cName.trim() })
        .eq("id", editCategory.id);
      if (error) {
        Alert.alert("Kesalahan", error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({ name: cName.trim() });
      if (error) {
        Alert.alert("Kesalahan", error.message);
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

      <AdminCatalogToolbar
        count={categories.length}
        countLabel="Total kategori"
        addLabel="Tambah Kategori"
        onAdd={openAdd}
        icon="pricetag-outline"
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={C.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={catalogShared.listContent}
          renderItem={({ item }) => {
            const count = item.products?.length || 0;
            const initial = (item.name || "?").charAt(0).toUpperCase();
            return (
              <View style={styles.card}>
                <View style={catalogShared.cardInner}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.countPill}>
                      <Ionicons
                        name="cube-outline"
                        size={12}
                        color={C.primaryDark}
                      />
                      <Text style={styles.productCount}>
                        {count} produk
                      </Text>
                    </View>

                    {count > 0 ? (
                      <View style={styles.chipWrap}>
                        {item.products!.slice(0, 3).map((product) => (
                          <View key={product.id} style={styles.productChip}>
                            <Text style={styles.productChipText} numberOfLines={1}>
                              {product.name}
                            </Text>
                          </View>
                        ))}
                        {count > 3 ? (
                          <View style={styles.moreChip}>
                            <Text style={styles.moreChipText}>
                              +{count - 3}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ) : (
                      <Text style={styles.emptyCategory}>Belum ada produk</Text>
                    )}

                    <AdminIconActionButtons
                      onEdit={() => openEdit(item)}
                      onDelete={() => deleteCategory(item.id)}
                    />
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <AdminCatalogEmpty
              icon="pricetag-outline"
              title="Belum ada kategori"
              subtitle="Buat kategori untuk mengelompokkan produk di beranda."
            />
          }
        />
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={catalogShared.modalBg}>
          <View style={[catalogShared.modalBox, { maxHeight: "44%" }]}>
            <AdminModalHeader
              icon="pricetag-outline"
              title={editCategory ? "Ubah Kategori" : "Tambah Kategori"}
              subtitle="Nama kategori akan tampil di filter beranda pengguna."
            />
            <Text style={catalogShared.inputLabel}>Nama Kategori *</Text>
            <TextInput
              style={catalogShared.input}
              value={cName}
              onChangeText={setCName}
              placeholder="Contoh: Alat Tulis"
              placeholderTextColor={C.textMuted}
            />
            <TouchableOpacity style={catalogShared.saveBtn} onPress={save}>
              <Text style={catalogShared.saveBtnText}>
                {editCategory ? "Simpan" : "Tambah"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={catalogShared.cancelBtn}
              onPress={() => setModal(false)}
            >
              <Text style={catalogShared.cancelBtnText}>Batal</Text>
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

const createCategoryStyles = (C: CatalogPalette) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    borderWidth: 1,
    borderColor: C.primarySoftBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: C.primary,
  },
  cardContent: { flex: 1, gap: 8 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.primarySoftBorder,
  },
  productCount: {
    fontSize: 12,
    color: C.primary,
    fontWeight: "700",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  productChip: {
    maxWidth: 140,
    backgroundColor: C.surfaceMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  productChipText: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "600",
  },
  moreChip: {
    backgroundColor: C.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.primarySoftBorder,
  },
  moreChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.primary,
  },
  emptyCategory: {
    fontSize: 12,
    color: C.textMuted,
    fontStyle: "italic",
  },
  });
