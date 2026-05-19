import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import KeyboardAwareModal from "../components/KeyboardAwareModal";
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

type HomeBanner = {
  id: string;
  title: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

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

const makeBannerPath = (fileName?: string | null) => {
  const ext = fileName?.split(".").pop() || "jpg";
  return `banner-${Date.now()}.${ext}`;
};

export default function BannersAdmin() {
  const { palette: C, catalogStyles: catalogShared, colors } = useAdminTheme();
  const styles = useMemo(() => createBannerStyles(C), [C]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editBanner, setEditBanner] = useState<HomeBanner | null>(null);
  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("home_banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) Alert.alert("Kesalahan", error.message);
    if (data) setBanners(data);
    setLoading(false);
  };

  const openAdd = () => {
    const nextOrder =
      banners.length > 0
        ? Math.max(...banners.map((b) => b.sort_order)) + 1
        : 0;
    setEditBanner(null);
    setTitle("");
    setSortOrder(String(nextOrder));
    setIsActive(true);
    setPickedImage(null);
    setExistingImageUrl("");
    setModal(true);
  };

  const openEdit = (banner: HomeBanner) => {
    setEditBanner(banner);
    setTitle(banner.title || "");
    setSortOrder(String(banner.sort_order));
    setIsActive(banner.is_active);
    setPickedImage(null);
    setExistingImageUrl(banner.image_url);
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

  const uploadBannerImage = async () => {
    if (pickedImage?.base64) {
      const path = makeBannerPath(pickedImage.fileName);
      const { error } = await supabase.storage
        .from("home-banners")
        .upload(path, base64ToArrayBuffer(pickedImage.base64), {
          contentType: pickedImage.mimeType || "image/jpeg",
          upsert: true,
        });
      if (error) throw error;
      const { data } = supabase.storage.from("home-banners").getPublicUrl(path);
      return data.publicUrl;
    }
    return existingImageUrl.trim();
  };

  const save = async () => {
    if (!editBanner && !pickedImage?.base64) {
      Alert.alert("Kesalahan", "Pilih gambar banner terlebih dulu.");
      return;
    }
    if (editBanner && !pickedImage?.base64 && !existingImageUrl.trim()) {
      Alert.alert("Kesalahan", "Banner harus punya gambar.");
      return;
    }

    setSaving(true);
    try {
      const imageUrl = await uploadBannerImage();
      if (!imageUrl) {
        Alert.alert("Kesalahan", "Gambar banner wajib diisi.");
        return;
      }

      const payload = {
        title: title.trim() || null,
        image_url: imageUrl,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      if (editBanner) {
        const { error } = await supabase
          .from("home_banners")
          .update(payload)
          .eq("id", editBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("home_banners").insert(payload);
        if (error) throw error;
      }

      setModal(false);
      fetchBanners();
    } catch (error: any) {
      Alert.alert("Kesalahan", error.message || "Gagal menyimpan banner.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (banner: HomeBanner, value: boolean) => {
    const { error } = await supabase
      .from("home_banners")
      .update({ is_active: value })
      .eq("id", banner.id);
    if (error) {
      Alert.alert("Kesalahan", error.message);
      return;
    }
    fetchBanners();
  };

  const deleteBanner = (id: string) => {
    Alert.alert("Hapus Banner", "Yakin ingin menghapus banner ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("home_banners")
            .delete()
            .eq("id", id);
          if (error) Alert.alert("Kesalahan", error.message);
          else fetchBanners();
        },
      },
    ]);
  };

  const previewUri = pickedImage?.uri || existingImageUrl;

  return (
    <View style={styles.container}>
      <AdminHeader title="Feed Banner" onMenuPress={() => setSidebarOpen(true)} />

      <AdminCatalogToolbar
        count={banners.length}
        countLabel="Total banner"
        addLabel="Unggah Banner"
        onAdd={openAdd}
        icon="images-outline"
        addBlock
        hint="Banner yang aktif akan tampil di Feed Beranda pengguna."
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={C.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={banners}
          keyExtractor={(item) => item.id}
          contentContainerStyle={catalogShared.listContent}
          ListEmptyComponent={
            <AdminCatalogEmpty
              icon="images-outline"
              title="Belum ada banner"
              subtitle="Unggah gambar promosi untuk ditampilkan di carousel beranda."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.imageHeader}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.thumb}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.statusPill,
                    item.is_active ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: item.is_active ? C.primary : C.textMuted,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      !item.is_active && styles.statusTextInactive,
                    ]}
                  >
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </Text>
                </View>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderBadgeText}>#{item.sort_order}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title || "Tanpa judul"}
                </Text>
                <View style={styles.activeRow}>
                  <View style={styles.activeLabelWrap}>
                    <Ionicons
                      name="eye-outline"
                      size={16}
                      color={C.textSecondary}
                    />
                    <Text style={styles.activeLabel}>Tampil di feed</Text>
                  </View>
                  <Switch
                    value={item.is_active}
                    onValueChange={(v) => toggleActive(item, v)}
                    trackColor={{ false: C.border, true: `${C.primary}88` }}
                    thumbColor={item.is_active ? C.primary : "#f4f4f4"}
                  />
                </View>
                <AdminIconActionButtons
                  onEdit={() => openEdit(item)}
                  onDelete={() => deleteBanner(item.id)}
                  editLabel="Edit"
                />
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={catalogShared.modalBg}>
          <View style={catalogShared.modalBox}>
            <KeyboardAwareModal extraScrollHeight={56}>
              <AdminModalHeader
                icon="images-outline"
                title={editBanner ? "Ubah Banner" : "Unggah Banner"}
                subtitle="Rasio disarankan lebar (landscape) agar pas di carousel beranda."
              />

              <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={styles.pickBtnText}>
                  {previewUri ? "Ganti Gambar" : "Pilih Gambar Banner"}
                </Text>
              </TouchableOpacity>

              {previewUri ? (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.preview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <Ionicons name="image-outline" size={40} color={C.textMuted} />
                  <Text style={styles.previewPlaceholderText}>
                    Pratinjau banner akan muncul di sini
                  </Text>
                </View>
              )}

              <Text style={catalogShared.inputLabel}>Judul (opsional)</Text>
              <TextInput
                style={catalogShared.input}
                placeholder="Contoh: Promo alat musik"
                placeholderTextColor={C.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={catalogShared.inputLabel}>Urutan tampil</Text>
              <TextInput
                style={catalogShared.input}
                placeholder="0"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                value={sortOrder}
                onChangeText={setSortOrder}
              />

              <View style={styles.switchRow}>
                <View style={styles.activeLabelWrap}>
                  <Ionicons
                    name="toggle-outline"
                    size={18}
                    color={C.textSecondary}
                  />
                  <Text style={styles.switchLabel}>Tampilkan di feed</Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: C.border, true: `${C.primary}88` }}
                  thumbColor={isActive ? C.primary : "#f4f4f4"}
                />
              </View>

              <TouchableOpacity
                style={[
                  catalogShared.saveBtn,
                  saving && catalogShared.saveBtnDisabled,
                ]}
                onPress={save}
                disabled={saving}
              >
                <Text style={catalogShared.saveBtnText}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={catalogShared.cancelBtn}
                onPress={() => setModal(false)}
              >
                <Text style={catalogShared.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </KeyboardAwareModal>
          </View>
        </View>
      </Modal>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/banners"
      />
    </View>
  );
}

const createBannerStyles = (C: CatalogPalette) =>
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
  imageHeader: { position: "relative" },
  thumb: { width: "100%", height: 152, backgroundColor: C.surfaceMuted },
  statusPill: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.primarySoftBorder,
  },
  statusInactive: {
    backgroundColor: C.surfaceMuted,
    borderWidth: 1,
    borderColor: C.border,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "800", color: C.primaryDark },
  statusTextInactive: { color: C.textMuted },
  orderBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: C.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  orderBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  cardBody: { padding: 14, gap: 10 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.text,
    lineHeight: 20,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  activeLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeLabel: { fontSize: 13, color: C.textSecondary, fontWeight: "600" },
  switchLabel: { fontSize: 13, color: C.textSecondary, fontWeight: "700" },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  pickBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  preview: {
    width: "100%",
    height: 168,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: C.surfaceMuted,
    borderWidth: 1,
    borderColor: C.border,
  },
  previewPlaceholder: {
    width: "100%",
    height: 168,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: C.surfaceMuted,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewPlaceholderText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: C.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  });
