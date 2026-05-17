import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

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

type Category = { id: string; name: string };

type PickedImage = {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};

const base64ToArrayBuffer = (base64: string) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i += 4) {
    const enc1 = chars.indexOf(clean.charAt(i));
    const enc2 = chars.indexOf(clean.charAt(i + 1));
    const enc3 = chars.indexOf(clean.charAt(i + 2));
    const enc4 = chars.indexOf(clean.charAt(i + 3));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    bytes.push(chr1);
    if (enc3 !== 64 && enc3 !== -1) bytes.push(chr2);
    if (enc4 !== 64 && enc4 !== -1) bytes.push(chr3);
  }

  return new Uint8Array(bytes).buffer;
};

const makeImagePath = (name: string, fileName?: string | null) => {
  const safeName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const ext = fileName?.split(".").pop() || "jpg";
  return `${safeName || "produk"}-${Date.now()}.${ext}`;
};

export default function Products() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pStock, setPStock] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pBrand, setPBrand] = useState("");
  const [pImage, setPImage] = useState("");
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [pCategory, setPCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (p.data) setProducts(p.data);
    if (c.data) setCategories(c.data);
    setLoading(false);
  };

  const openAdd = () => {
    setEditProduct(null);
    setPName("");
    setPPrice("");
    setPStock("");
    setPDesc("");
    setPBrand("");
    setPImage("");
    setPickedImage(null);
    setPCategory("");
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setPName(p.name);
    setPPrice(p.price.toString());
    setPStock(p.stock.toString());
    setPDesc(p.description || "");
    setPBrand(p.brand || "");
    setPImage(p.image_url || "");
    setPickedImage(null);
    setPCategory(p.category_id || "");
    setModal(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      base64: true,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0]);
    }
  };

  const uploadProductImage = async () => {
    if (!pickedImage?.base64) return pImage.trim();

    const path = makeImagePath(pName, pickedImage.fileName);
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, base64ToArrayBuffer(pickedImage.base64), {
        contentType: pickedImage.mimeType || "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    if (!pName.trim() || !pPrice.trim() || !pStock.trim()) {
      Alert.alert("Error", "Nama, harga, dan stok wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const imageUrl = await uploadProductImage();
      const payload = {
        name: pName.trim(),
        price: parseInt(pPrice),
        stock: parseInt(pStock),
        description: pDesc.trim(),
        brand: pBrand.trim(),
        image_url: imageUrl,
        category_id: pCategory || null,
      };

      if (editProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }

      setModal(false);
      fetchData();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = (id: string) => {
    Alert.alert("Hapus Produk", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await supabase.from("products").delete().eq("id", id);
          fetchData();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Produk" onMenuPress={() => setSidebarOpen(true)} />

      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>+ Tambah Produk</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.productThumb}
                  resizeMode="cover"
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>
                  Rp {item.price.toLocaleString("id-ID")} · Stok: {item.stock}
                </Text>
                {item.brand ? (
                  <Text style={styles.cardMeta}>{item.brand}</Text>
                ) : null}
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
                  onPress={() => deleteProduct(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada produk.</Text>
          }
        />
      )}

      {/* Modal */}
      <Modal visible={modal} animationType="slide" transparent>
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
                  placeholder: "15000",
                  keyboard: "numeric",
                },
                {
                  label: "Stok *",
                  value: pStock,
                  setter: setPStock,
                  placeholder: "10",
                  keyboard: "numeric",
                },
                {
                  label: "Brand",
                  value: pBrand,
                  setter: setPBrand,
                  placeholder: "Stabilo",
                },
                {
                  label: "Deskripsi",
                  value: pDesc,
                  setter: setPDesc,
                  placeholder: "Deskripsi produk",
                },
              ].map((f) => (
                <View key={f.label}>
                  <Text style={styles.inputLabel}>{f.label}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      f.label === "Deskripsi" && { height: 80 },
                    ]}
                    value={f.value}
                    onChangeText={f.setter}
                    placeholder={f.placeholder}
                    placeholderTextColor="#999"
                    keyboardType={(f.keyboard as any) || "default"}
                    multiline={f.label === "Deskripsi"}
                  />
                </View>
              ))}

              <Text style={styles.inputLabel}>Gambar Produk</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {pickedImage?.uri || pImage ? (
                  <Image
                    source={{ uri: pickedImage?.uri || pImage }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderIcon}>+</Text>
                    <Text style={styles.imagePlaceholderText}>
                      Pilih gambar dari galeri
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Gambar akan di-upload ke Supabase Storage otomatis.
              </Text>

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
                      styles.chip,
                      pCategory === c.id && styles.chipActive,
                    ]}
                    onPress={() => setPCategory(c.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        pCategory === c.id && styles.chipTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={save}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editProduct ? "Simpan Perubahan" : "Tambah Produk"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModal(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/products"
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  productThumb: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  cardSub: { fontSize: 12, color: "#2D6A4F", marginTop: 2 },
  cardMeta: { fontSize: 11, color: "#888", marginTop: 2 },
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
  imagePicker: {
    height: 190,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    borderWidth: 1.5,
    borderColor: "#dcdcdc",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderIcon: {
    fontSize: 34,
    lineHeight: 38,
    color: "#2D6A4F",
    fontWeight: "900",
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "700",
    marginTop: 4,
  },
  helperText: { fontSize: 11, color: "#888", marginTop: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chipActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" },
  chipText: { fontSize: 12, color: "#555", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  saveBtn: {
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: "#888", fontSize: 14 },
});
