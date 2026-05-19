import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
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
  const { palette: C, catalogStyles: catalogShared, colors } = useAdminTheme();
  const styles = useMemo(() => createProductStyles(C), [C]);

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
      Alert.alert("Kesalahan", "Nama, harga, dan stok wajib diisi.");
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
      Alert.alert("Kesalahan", error.message || "Gagal menyimpan produk.");
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

  const categoryName =
    categories.find((c) => c.id === pCategory)?.name || null;

  return (
    <View style={styles.container}>
      <AdminHeader title="Produk" onMenuPress={() => setSidebarOpen(true)} />

      <AdminCatalogToolbar
        count={products.length}
        countLabel="Total produk"
        addLabel="Tambah Produk"
        onAdd={openAdd}
        icon="cube-outline"
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={C.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={catalogShared.listContent}
          renderItem={({ item }) => {
            const catLabel = categories.find((c) => c.id === item.category_id)
              ?.name;
            return (
              <View style={styles.card}>
                <View style={catalogShared.cardInner}>
                  <View style={styles.thumbWrap}>
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.productThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.thumbPlaceholder}>
                        <Ionicons
                          name="image-outline"
                          size={22}
                          color={C.textMuted}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardPrice}>
                      Rp {item.price.toLocaleString("id-ID")}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.stockBadge}>
                        <Ionicons
                          name="layers-outline"
                          size={11}
                          color={C.primaryDark}
                        />
                        <Text style={styles.stockBadgeText}>
                          Stok {item.stock}
                        </Text>
                      </View>
                      {catLabel ? (
                        <View style={styles.catBadge}>
                          <Text style={styles.catBadgeText} numberOfLines={1}>
                            {catLabel}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {item.brand ? (
                      <Text style={styles.cardMeta} numberOfLines={1}>
                        {item.brand}
                      </Text>
                    ) : null}
                    <AdminIconActionButtons
                      onEdit={() => openEdit(item)}
                      onDelete={() => deleteProduct(item.id)}
                    />
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <AdminCatalogEmpty
              icon="cube-outline"
              title="Belum ada produk"
              subtitle="Tap Tambah Produk untuk menambahkan item ke katalog toko."
            />
          }
        />
      )}

      {/* Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={catalogShared.modalBg}>
          <View style={catalogShared.modalBox}>
            <AdminModalHeader
              icon="cube-outline"
              title={editProduct ? "Ubah Produk" : "Tambah Produk"}
              subtitle="Lengkapi detail produk untuk tampil di beranda pengguna."
            />
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              contentContainerStyle={styles.modalScrollContent}
            >
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
                  <Text style={catalogShared.inputLabel}>{f.label}</Text>
                  <TextInput
                    style={[
                      catalogShared.input,
                      f.label === "Deskripsi" && { height: 80 },
                    ]}
                    value={f.value}
                    onChangeText={f.setter}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType={(f.keyboard as any) || "default"}
                    multiline={f.label === "Deskripsi"}
                  />
                </View>
              ))}

              <Text style={catalogShared.inputLabel}>Gambar Produk</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {pickedImage?.uri || pImage ? (
                  <Image
                    source={{ uri: pickedImage?.uri || pImage }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={32}
                      color={C.primary}
                    />
                    <Text style={styles.imagePlaceholderText}>
                      Pilih gambar dari galeri
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Gambar akan di-upload ke Supabase Storage otomatis.
              </Text>

              <Text style={catalogShared.inputLabel}>Kategori</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      catalogShared.chip,
                      pCategory === c.id && catalogShared.chipActive,
                    ]}
                    onPress={() => setPCategory(c.id)}
                  >
                    <Text
                      style={[
                        catalogShared.chipText,
                        pCategory === c.id && catalogShared.chipTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {categoryName ? (
                <Text style={styles.selectedCatHint}>
                  Kategori dipilih: {categoryName}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  catalogShared.saveBtn,
                  saving && catalogShared.saveBtnDisabled,
                ]}
                onPress={save}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={catalogShared.saveBtnText}>
                    {editProduct ? "Simpan Perubahan" : "Tambah Produk"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={catalogShared.cancelBtn}
                onPress={() => setModal(false)}
              >
                <Text style={catalogShared.cancelBtnText}>Batal</Text>
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

const createProductStyles = (C: CatalogPalette) =>
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
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: C.surfaceMuted,
    borderWidth: 1,
    borderColor: C.border,
  },
  productThumb: { width: "100%", height: "100%" },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1, gap: 6 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.text,
    lineHeight: 20,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: C.primary,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.primarySoftBorder,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
  },
  catBadge: {
    maxWidth: 120,
    backgroundColor: C.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: C.textSecondary,
  },
  cardMeta: { fontSize: 11, color: C.textMuted },
  modalScrollContent: { paddingBottom: 28 },
  imagePicker: {
    height: 190,
    borderRadius: 16,
    backgroundColor: C.surfaceMuted,
    borderWidth: 1.5,
    borderColor: C.primarySoftBorder,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: "700",
  },
  helperText: { fontSize: 11, color: C.textMuted, marginTop: 6 },
  selectedCatHint: {
    fontSize: 12,
    color: C.primary,
    fontWeight: "600",
    marginTop: 8,
  },
  });
